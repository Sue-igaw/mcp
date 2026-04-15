"use client";

import { useState } from "react";

export default function SecretField({ label, value, warning }: { label: string; value: string; warning?: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const masked = value.replace(/./g, "•");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-mi-gray-50 rounded-xl px-5 py-4 mb-3">
      <div className="text-[13px] font-semibold text-mi-gray-500 mb-1.5">{label}</div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-[13px] font-mono text-mi-gray-900 break-all select-all">
          {revealed ? value : masked}
        </code>
        <button
          onClick={() => setRevealed(!revealed)}
          className="shrink-0 text-[12px] font-medium text-mi-violet hover:text-mi-violet/80 cursor-pointer transition-colors"
        >
          {revealed ? "숨기기" : "표시하기"}
        </button>
        {revealed && (
          <button
            onClick={handleCopy}
            className="shrink-0 text-[12px] font-medium text-mi-violet hover:text-mi-violet/80 cursor-pointer transition-colors"
          >
            {copied ? "복사됨 ✓" : "복사"}
          </button>
        )}
      </div>
      {warning && (
        <p className="text-[12px] text-red-500 mt-2.5 leading-relaxed">{warning}</p>
      )}
    </div>
  );
}
