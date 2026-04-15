"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { auth, provider, ALLOWED_DOMAIN } from "@/lib/firebase";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && u.email && u.email.endsWith("@" + ALLOWED_DOMAIN)) {
        setUser(u);
        setError("");
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email || "";
      if (!email.endsWith("@" + ALLOWED_DOMAIN)) {
        await signOut(auth);
        setError(`@${ALLOWED_DOMAIN} 계정만 접근할 수 있습니다.`);
      }
    } catch (err: unknown) {
      if (err instanceof Error && "code" in err && (err as { code: string }).code !== "auth/popup-closed-by-user") {
        setError("로그인에 실패했습니다.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[15px] text-mi-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#f8f9fa" }}>
        <div className="text-center px-6" style={{ maxWidth: 420 }}>
          <div style={{ fontSize: "3rem", marginBottom: 20 }}>🔒</div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#191f28", marginBottom: 8, letterSpacing: "-0.03em" }}>모바일인덱스 MCP BETA 연동 가이드</h1>
          <p style={{ fontSize: "0.9375rem", color: "#8b95a1", marginBottom: 48 }}>
            @{ALLOWED_DOMAIN} 만 접근 가능합니다.
          </p>
          <button
            onClick={handleLogin}
            style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 36px", background: "#fff", border: "1px solid #e5e8eb", borderRadius: 12, fontFamily: "inherit", fontSize: "0.9375rem", fontWeight: 600, color: "#191f28", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 18, height: 18 }} />
            Google 계정으로 로그인
          </button>
          {error && (
            <p style={{ marginTop: 16, fontSize: "0.8125rem", color: "#e8484a" }}>{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-[52px] px-6 bg-white border-b border-mi-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-mi-black">모바일인덱스 MCP</span>
          <span className="inline-flex items-center text-[10px] font-bold text-mi-violet bg-mi-violet-light px-1.5 py-0.5 rounded-full">BETA</span>
          <span className="text-[13px] text-mi-gray-500 ml-1">연동 가이드</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-mi-gray-500">{user.email}</span>
          <button
            onClick={() => signOut(auth)}
            className="text-[11px] px-3 py-1 border border-mi-gray-300 rounded-md hover:border-mi-gray-500 transition-all cursor-pointer text-mi-gray-500 hover:text-mi-gray-700"
          >
            로그아웃
          </button>
        </div>
      </div>
      <div className="pt-[52px]">
        {children}
      </div>
    </div>
  );
}
