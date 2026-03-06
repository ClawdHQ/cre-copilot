"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import axios from "axios";
import WorkflowForm from "../components/WorkflowForm";
import CodeOutput from "../components/CodeOutput";

interface GenerateOptions {
  triggerType: "http" | "cron" | "evmLog";
  includeComments: boolean;
  targetChainId: number;
}

interface GenerationResult {
  success: boolean;
  generatedCode: string;
  simulationCommand: string;
  validationScore: number;
  attempts: number;
  logTxHash: string | null;
  errors?: string[];
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  const handleGenerate = async (
    description: string,
    options: GenerateOptions
  ) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const r = await axios.post(`${backendUrl}/api/generate-direct`, {
        description,
        generatorAddress: address || "0x0000000000000000000000000000000000000000",
        options,
      });
      setResult(r.data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-white">
          CRE Workflow Generator
        </h1>
        <p className="text-gray-400">
          Describe what you want. Get a production-ready Chainlink CRE workflow.
        </p>
        <span className="inline-block bg-violet-900 border border-violet-700 text-violet-300 text-xs px-3 py-1 rounded-full">
          ⚙️ Powered by Gemini Flash Lite (OpenRouter) + Chainlink CRE
        </span>
      </div>

      <WorkflowForm onGenerate={handleGenerate} loading={loading} />

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 rounded-xl p-4">
          {error}
        </div>
      )}

      {result && result.success && (
        <CodeOutput
          code={result.generatedCode}
          validationScore={result.validationScore}
          errors={result.errors || []}
          simulationCommand={result.simulationCommand}
          logTxHash={result.logTxHash}
          attempts={result.attempts}
        />
      )}

      {result && !result.success && (
        <div className="bg-red-900 border border-red-700 text-red-300 rounded-xl p-4 space-y-2">
          <p className="font-semibold">Generation failed</p>
          {result.errors && result.errors.length > 0 && (
            <ul className="list-disc list-inside text-sm">
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
