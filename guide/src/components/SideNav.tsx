"use client";
import { useEffect, useState } from "react";

const SECTIONS: { items: { id: string; label: string; icon?: string; badge?: string }[] }[] = [
  {
    items: [{ id: "overview", label: "시작하기 전에" }],
  },
  {
    items: [
      { id: "kiro", label: "Kiro", icon: "https://kiro.dev/favicon.ico" },
      { id: "claude", label: "Claude Desktop", icon: "https://claude.com/favicon.ico" },
      { id: "chatgpt", label: "ChatGPT", icon: "/guide/icons/chatgpt.svg", badge: "준비중" },
      { id: "cursor", label: "Cursor", icon: "https://cursor.com/favicon.ico", badge: "준비중" },
      { id: "windsurf", label: "Windsurf", icon: "https://windsurf.com/favicon.ico", badge: "준비중" },
    ],
  },
  {
    items: [
      { id: "tools", label: "도구 목록" },
      { id: "examples", label: "사용 예시" },
      { id: "troubleshoot", label: "트러블슈팅" },
    ],
  },
];

const ALL_IDS = SECTIONS.flatMap((s) => s.items.map((i) => i.id));

export default function SideNav() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    ALL_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="hidden lg:flex flex-col w-60 shrink-0 border-r border-mi-gray-100 sticky top-0 h-screen overflow-y-auto py-10 px-5">
      <div className="px-3 mb-8">
        <div className="text-[14px] font-bold text-mi-black leading-snug">모바일인덱스 MCP 연동 가이드</div>
        <span className="inline-flex items-center text-[11px] font-bold text-mi-violet bg-mi-violet-light px-2 py-0.5 rounded-full mt-2">BETA</span>
      </div>
      {SECTIONS.map((section, i) => (
        <div key={i}>
          {i > 0 && <div className="border-t border-mi-gray-100 my-3 mx-3" />}
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`flex items-center gap-2.5 text-[14px] rounded-xl px-3 py-2 transition-all ${
                    active === item.id
                      ? "text-mi-violet bg-mi-violet-light font-semibold"
                      : "text-mi-gray-500 hover:text-mi-gray-900 hover:bg-mi-gray-50"
                  }`}
                >
                  {item.icon && (
                    <img src={item.icon} alt="" className="w-4 h-4 rounded-sm" />
                  )}
                  {item.label}
                  {item.badge && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full ml-1">{item.badge}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
