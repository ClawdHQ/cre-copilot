import { execFile } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as crypto from "crypto";

const execFileAsync = promisify(execFile);

export interface SimulationResult {
  success: boolean;
  output: string;
  error?: string;
  durationMs: number;
}

export async function runSimulation(
  workflowCode: string,
  inputJson: string
): Promise<SimulationResult> {
  if (process.env.CRE_SIM_MODE === "mock") {
    const payloadHash = crypto
      .createHash("sha256")
      .update(workflowCode + inputJson)
      .digest("hex");
    return {
      success: true,
      output: `MOCK_CRE_SIMULATION_OK hash=${payloadHash}`,
      durationMs: 1,
    };
  }

  const tempFilePath = `/tmp/cre-copilot-sim-${crypto.randomBytes(16).toString("hex")}.ts`;
  fs.writeFileSync(tempFilePath, workflowCode);
  const start = Date.now();
  const cliPath = process.env.CRE_CLI_PATH || "cre-cli";

  try {
    const { stdout, stderr } = await execFileAsync(
      cliPath,
      ["simulate", tempFilePath, "--input", inputJson, "--network", "sepolia"],
      { timeout: 30000 }
    );
    return {
      success: true,
      output: stdout + stderr,
      durationMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const error = err as Error;
    const isMissingCli = /ENOENT|not found/i.test(error.message || "");
    return {
      success: false,
      error: isMissingCli
        ? `cre-cli executable not found. Set CRE_CLI_PATH or enable CRE_SIM_MODE=mock for CI dry simulation. Original error: ${error.message}`
        : error.message,
      output: "",
      durationMs: Date.now() - start,
    };
  } finally {
    try {
      fs.unlinkSync(tempFilePath);
    } catch {
      // ignore cleanup errors
    }
  }
}
