"use client";

import { useState } from "react";

interface ValidationBadgeProps {
  score: number;
  errors: string[];
}

export default function ValidationBadge({ score, errors }: ValidationBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  let badgeClass: string;
  let label: string;
  if (score >= 80) {
    badgeClass = "bg-green-900 border border-green-700 text-green-300";
    label = `✓ Valid (${score}/100)`;
  } else if (score >= 50) {
    badgeClass = "bg-yellow-900 border border-yellow-700 text-yellow-300";
    label = `⚠ Partial (${score}/100)`;
  } else {
    badgeClass = "bg-red-900 border border-red-700 text-red-300";
    label = `✗ Invalid (${score}/100)`;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`text-xs px-3 py-1 rounded-full ${badgeClass}`}>
        {label}
      </span>
      {errors.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-red-400 hover:text-red-300"
          >
            {errors.length} issue(s) {expanded ? "▲" : "▼"}
          </button>
          {expanded && (
            <ul className="mt-1 space-y-0.5">
              {errors.map((e, i) => (
                <li key={i} className="text-xs text-red-400">
                  • {e}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
