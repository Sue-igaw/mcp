"use client";
import { useState } from "react";

export default function CodeBlock({ label, children }: { label?: string; children: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-2xl overflow-hidden my-5 border border-mi-gray-100">
      <div className="flex items-center justify-between px-5 py-3 bg-mi-gray-50 border-b border-mi-gray-100">
        <span className="text-[13px] font-medium text-mi-gray-500">{label}</span>
        <button
          onClick={copy}
          className={`text-[13px] font-medium px-3 py-1 rounded-lg transition-all cursor-pointer ${
            copied
              ? "bg-mi-violet text-white"
              : "text-mi-gray-500 hover:text-mi-violet hover:bg-mi-violet-light"
          }`}
        >
          {copied ? "복사됨 ✓" : "복사"}
        </button>
      </div>
      <pre className="bg-mi-black p-5 overflow-x-auto">
        <code className="text-[13px] leading-relaxed text-[#c9d1d9] font-mono whitespace-pre">{children}</code>
      </pre>
    </div>
  );
}
