"use client";

import { useEffect, useState } from "react";

interface LogRecord {
  contentHash: string;
  generator: string;
  description: string;
  timestamp: number;
  validationScore: number;
}

export default function HistoryPage() {
  const [records, setRecords] = useState<LogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    fetch(`${backendUrl}/api/log/recent?limit=20`)
      .then((r) => r.json())
      .then((data) => {
        setRecords(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const scoreBadge = (score: number) => {
    if (score >= 80) return "bg-green-900 border-green-700 text-green-300";
    if (score >= 50) return "bg-yellow-900 border-yellow-700 text-yellow-300";
    return "bg-red-900 border-red-700 text-red-300";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Onchain Generation Log</h1>
        <p className="text-gray-400 mt-1">
          Permanent records of all CRE workflow generations on Sepolia.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-800 h-12 rounded"
            />
          ))}
        </div>
      ) : records.length === 0 ? (
        <p className="text-gray-500">No generations logged yet.</p>
      ) : (
        <div className="space-y-3">
          {records.map((r, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-gray-400">
                  {r.contentHash.slice(0, 10)}...{r.contentHash.slice(-6)}
                </span>
                <span
                  className={`text-xs border px-2 py-0.5 rounded-full ${scoreBadge(r.validationScore)}`}
                >
                  {r.validationScore}/100
                </span>
              </div>
              <p className="text-sm text-white">
                {r.description.slice(0, 60)}
                {r.description.length > 60 ? "..." : ""}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {r.generator.slice(0, 6)}...{r.generator.slice(-4)}
                </span>
                <span>
                  {new Date(r.timestamp * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
