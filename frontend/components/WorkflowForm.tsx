"use client";

import { useState } from "react";

interface GenerateOptions {
  triggerType: "http" | "cron" | "evmLog";
  includeComments: boolean;
  targetChainId: number;
}

interface WorkflowFormProps {
  onGenerate: (description: string, options: GenerateOptions) => void;
  loading: boolean;
}

export default function WorkflowForm({ onGenerate, loading }: WorkflowFormProps) {
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<"http" | "cron" | "evmLog">("http");
  const [includeComments, setIncludeComments] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(description, {
      triggerType,
      includeComments,
      targetChainId: 11155111,
    });
  };

  const triggerButtons: Array<{ value: "http" | "cron" | "evmLog"; label: string }> = [
    { value: "http", label: "HTTP Trigger" },
    { value: "cron", label: "Cron Trigger" },
    { value: "evmLog", label: "EVM Log Trigger" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-300 mb-1">
          Describe your CRE workflow
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='e.g. "Monitor ETH/USDC price every 5 minutes and trigger a Telegram alert when price crosses $3000"'
          className="w-full h-36 resize-none bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
        />
      </div>

      <div className="flex gap-2">
        {triggerButtons.map((btn) => (
          <button
            key={btn.value}
            type="button"
            onClick={() => setTriggerType(btn.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              triggerType === btn.value
                ? "bg-violet-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
        <input
          type="checkbox"
          checked={includeComments}
          onChange={(e) => setIncludeComments(e.target.checked)}
          className="accent-violet-500"
        />
        Include inline comments
      </label>

      <button
        type="submit"
        disabled={description.trim().length < 10 || loading}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {loading ? "Generating..." : "✨ Generate Workflow"}
      </button>
    </form>
  );
}
