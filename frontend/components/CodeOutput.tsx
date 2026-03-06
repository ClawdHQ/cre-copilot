"use client";

import { useState } from "react";
import ValidationBadge from "./ValidationBadge";

interface CodeOutputProps {
  code: string;
  validationScore: number;
  errors: string[];
  simulationCommand: string;
  logTxHash: string | null;
  attempts: number;
}

export default function CodeOutput({
  code,
  validationScore,
  errors,
  simulationCommand,
  logTxHash,
  attempts,
}: CodeOutputProps) {
  const [copied, setCopied] = useState(false);
  const [cmdCopied, setCmdCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCmd = () => {
    navigator.clipboard.writeText(simulationCommand);
    setCmdCopied(true);
    setTimeout(() => setCmdCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold text-white">Generated Workflow</h2>
        <ValidationBadge score={validationScore} errors={errors} />
      </div>

      {/* Code block */}
      <div className="relative">
        <pre className="bg-gray-900 border border-gray-800 rounded-xl p-4 max-h-[500px] overflow-auto text-sm font-mono text-green-300 whitespace-pre-wrap">
          {code}
        </pre>
        <button
          onClick={copyCode}
          className="absolute top-3 right-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Simulation command */}
      <div className="space-y-1">
        <p className="text-xs text-gray-400">Simulation Command</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-gray-800 px-3 py-2 rounded text-xs font-mono text-gray-300 overflow-x-auto">
            {simulationCommand}
          </code>
          <button
            onClick={copyCmd}
            className="shrink-0 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-2 rounded"
          >
            {cmdCopied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Attempts badge */}
      {attempts > 1 && (
        <span className="inline-block bg-yellow-900 border border-yellow-700 text-yellow-300 text-xs px-3 py-1 rounded-full">
          Fixed in {attempts} attempt(s)
        </span>
      )}

      {/* Onchain link */}
      {logTxHash && (
        <a
          href={`https://sepolia.etherscan.io/tx/${logTxHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-violet-400 underline hover:text-violet-300"
        >
          View onchain log → {logTxHash.slice(0, 10)}...
        </a>
      )}
    </div>
  );
}
