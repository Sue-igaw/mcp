import type { Metadata } from "next";
import "pretendard/dist/web/static/pretendard.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "모바일인덱스 MCP 연동 가이드",
  description: "AI 플랫폼에서 모바일인덱스 데이터를 자연어로 조회하기 위한 MCP 연결 방법 안내",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col font-pretendard">{children}</body>
    </html>
  );
}
