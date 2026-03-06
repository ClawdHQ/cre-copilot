import { Router, Request, Response, NextFunction } from "express";
import axios from "axios";
import { ethers } from "ethers";
import { validateCREWorkflow } from "../services/validator";

const router = Router();

const CRE_SYSTEM_PROMPT = `You are an expert Chainlink CRE (Chainlink Runtime Environment) TypeScript developer.
Generate complete, valid CRE workflow TypeScript files based on user descriptions.
Always import { workflow, triggers, capabilities } from "@chainlink/cre-sdk".
Use exactly one trigger per workflow: triggers.http(), triggers.cron(expr), or triggers.evmLog({...}).
Available capabilities: capabilities.http(), capabilities.confidentialHttp(),
  capabilities.evmRead(), capabilities.evmWrite().
Always export default workflow({...}).
Return ONLY valid TypeScript code with no markdown fences, no explanation, no preamble.
The code must compile and be a complete, runnable CRE workflow.`;

const CRE_SCHEMA_CONTEXT = `Key CRE TypeScript patterns:
TRIGGER - HTTP: triggers.http() — workflow starts on HTTP POST, input is parsed from request body
TRIGGER - Cron: triggers.cron("*/5 * * * *") — fires on schedule
TRIGGER - EVM Log: triggers.evmLog({ chainId: 11155111, address: "0x...", eventAbi: "event ..." })
CAPABILITY - HTTP: await capabilities.http({ url, method, headers, body }) → returns parsed JSON
CAPABILITY - Confidential HTTP: same API as http but API keys stay encrypted in DON
CAPABILITY - EVM Read: await capabilities.evmRead({ contractAddress, abi: ["..."], functionName, args, chainId })
CAPABILITY - EVM Write: await capabilities.evmWrite({ contractAddress, abi: ["..."], functionName, args, chainId })
WORKFLOW SHAPE: workflow({ trigger: triggers.X(), execute: async (input, ctx) => { ... return result } })
IMPORTANT: No top-level await. No fs, no net, no node built-ins. Only CRE SDK capabilities for I/O.
Cron expressions: standard 5-part cron, e.g. "0 * * * *" = hourly, "*/5 * * * *" = every 5 min.`;

const WORKFLOW_LOG_ABI = [
  "function logGeneration(bytes32, address, string, uint8) external",
];

async function callOpenRouter(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY || "";
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables");
  }

  const response = await axios.post(
    `https://openrouter.ai/api/v1/chat/completions`,
    {
      model: "google/gemini-2.5-flash-lite",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://chain.link",
        "X-Title": "CRECopilot"
      },
    }
  );

  if (!response.data || !response.data.choices || response.data.choices.length === 0) {
    throw new Error("Invalid response from OpenRouter API");
  }

  const text: string = response.data.choices[0].message.content;
  return text.replace(/```typescript|```ts|```/g, "").trim();
}

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description, generatorAddress, options = {} } = req.body;
    const {
      triggerType = "http",
      includeComments = false,
      targetChainId = 11155111,
    } = options;

    // Step 1 — Build prompt
    let prompt = `${CRE_SYSTEM_PROMPT}\n\n${CRE_SCHEMA_CONTEXT}\n\nUser request: ${description}`;
    if (triggerType) {
      prompt += `\n\nUse trigger type: ${triggerType}`;
    }
    if (includeComments) {
      prompt += "\n\nInclude inline comments explaining each step.";
    }
    if (targetChainId) {
      prompt += `\n\nTarget chain ID: ${targetChainId}`;
    }

    // Step 2 — Call OpenRouter
    let generatedCode = await callOpenRouter(prompt);

    // Step 3 — Validate with retry (max 3 attempts)
    let validationResult = await validateCREWorkflow(generatedCode);
    let attempts = 1;

    while (!validationResult.valid && attempts < 3) {
      const fixPrompt = `Fix these CRE TypeScript errors: ${validationResult.errors.join(", ")}. Return ONLY corrected code.`;
      generatedCode = await callOpenRouter(fixPrompt);
      validationResult = await validateCREWorkflow(generatedCode);
      attempts++;
    }

    // Step 4 — Simulation command (display only, not executed server-side)
    const simulationCommand = `cre-cli simulate ./my-workflow.ts --input ${JSON.stringify(JSON.stringify({ description }))} --network sepolia`;

    // Step 5 — Log onchain
    let logTxHash: string | null = null;
    try {
      const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
      const contract = new ethers.Contract(
        process.env.WORKFLOW_LOG_ADDRESS || "",
        WORKFLOW_LOG_ABI,
        wallet
      );
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes(generatedCode));
      const tx = await contract.logGeneration(
        contentHash,
        generatorAddress,
        (description || "").slice(0, 256),
        validationResult.score
      );
      const receipt = await tx.wait();
      logTxHash = receipt.hash;
    } catch {
      // Log failure is non-fatal
    }

    res.json({
      success: validationResult.valid,
      generatedCode,
      simulationCommand,
      validationScore: validationResult.score,
      attempts,
      logTxHash,
      errors: validationResult.errors,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
