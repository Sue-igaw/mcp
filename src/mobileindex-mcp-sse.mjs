#!/usr/bin/env node
/**
 * 모바일인덱스 MCP 서버 — SSE (원격) 버전
 * 
 * 기존 stdio 버전(mobileindex-mcp.mjs)과 동일한 27개 도구를 제공하며,
 * SSE(Server-Sent Events) 전송 방식으로 원격 AI 플랫폼에서 접속할 수 있습니다.
 * 
 * 환경변수:
 *   MI_API_TOKEN      — 모바일인덱스 Insight API 토큰 (필수)
 *   PORT              — 서버 포트 (기본 3001)
 *   ALLOWED_API_KEYS  — 허용된 API 키 목록, 쉼표 구분 (베타용)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import http from "node:http";

// ─── 설정 ───
const API_BASE = "https://data.mobileindex.com/v1/insight";
const API_TOKEN = process.env.MI_API_TOKEN || "";
const PORT = parseInt(process.env.PORT || "3001", 10);
const ALLOWED_KEYS = (process.env.ALLOWED_API_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

// ─── API 호출 ───
async function callApi(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  if (!res.ok) {
    const status = res.status;
    if (status === 404) return { source: "모바일인덱스 INSIGHT", error: "해당 데이터는 현재 준비 중이거나 제공되지 않습니다." };
    if (status === 401) return { source: "모바일인덱스 INSIGHT", error: "인증에 실패했습니다. API 키를 확인해주세요." };
    if (status === 429) return { source: "모바일인덱스 INSIGHT", error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." };
    return { source: "모바일인덱스 INSIGHT", error: `일시적으로 데이터를 조회할 수 없습니다. (${status})` };
  }
  const json = await res.json();
  return { source: "모바일인덱스 INSIGHT", ...json };
}

// ─── API 키 검증 ───
function verifyApiKey(req) {
  if (ALLOWED_KEYS.length === 0) return true; // 키 목록 미설정 시 통과 (개발용)
  const auth = req.headers.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return ALLOWED_KEYS.includes(token);
}

// ─── MCP 서버 생성 ───
function createServer() {
  const server = new McpServer({ name: "mobileindex", version: "1.0.0" });

  // ─── 공통 ───
  server.registerTool("search_app", { description: "앱 이름이나 패키지명으로 모바일인덱스에서 앱을 검색합니다. 다른 도구에서 pkgName이 필요할 때 먼저 이 도구로 검색하세요.", inputSchema: { keyword: z.string().min(2).describe("검색 키워드 (앱명 또는 패키지명, 2글자 이상)"), viewCnt: z.number().optional().describe("최대 출력 수 (기본 10)") } }, async ({ keyword, viewCnt }) => { const data = await callApi("/common/search", { keyword, viewCnt }); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("get_categories_main", { description: "업종 대분류 목록을 조회합니다. appCateMain 코드를 확인할 때 사용하세요.", inputSchema: {} }, async () => { const data = await callApi("/common/cate-main"); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("get_categories_sub", { description: "업종 소분류 목록을 조회합니다.", inputSchema: { appCateMain: z.string().describe("업종 대분류 코드") } }, async ({ appCateMain }) => { const data = await callApi("/common/cate-sub", { appCateMain }); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });

  // ─── 차트 ───
  server.registerTool("chart_top_usage", { description: "통합 사용자 수 순위를 조회합니다.", inputSchema: { dateType: z.enum(["d","w","m"]).describe("조회 기간"), date: z.string().describe("조회일 (yyyymmdd)"), appType: z.enum(["all","app","game"]).describe("앱 구분"), startRank: z.number().optional(), endRank: z.number().optional() } }, async (p) => { const data = await callApi("/chart/top/usage", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("chart_top_revenue", { description: "통합 매출 순위를 조회합니다.", inputSchema: { dateType: z.enum(["d","w","m"]).describe("조회 기간"), date: z.string().describe("조회일 (yyyymmdd)"), appType: z.enum(["all","app","game"]).describe("앱 구분"), startRank: z.number().optional(), endRank: z.number().optional() } }, async (p) => { const data = await callApi("/chart/top/revenue", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("chart_market_rank", { description: "일간 마켓별 순위를 조회합니다 (대한민국).", inputSchema: { market: z.enum(["google","apple","one"]).describe("마켓"), date: z.string().describe("조회일 (yyyymmdd)"), appType: z.enum(["app","game"]).describe("앱 구분"), rankType: z.enum(["all","free","paid","gross"]).optional(), startRank: z.number().optional(), endRank: z.number().optional() } }, async (p) => { const data = await callApi("/chart/market/rank", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("chart_market_global_rank", { description: "일간 마켓별 순위를 조회합니다 (글로벌 20개국).", inputSchema: { date: z.string().describe("조회일 (yyyymmdd)"), country: z.enum(["us","cn","jp","tw","sg","de","gb","in","ca","ru","th","id","my","hk","ph","tr","se","fr","au","es"]).describe("국가 코드"), market: z.enum(["google","apple"]).describe("마켓"), appType: z.enum(["app","game"]).describe("앱 구분"), rankType: z.enum(["all","free","paid","gross"]).optional(), startRank: z.number().optional(), endRank: z.number().optional() } }, async (p) => { const data = await callApi("/chart/market/global-rank", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("chart_market_realtime_rank", { description: "실시간 마켓별 순위를 조회합니다.", inputSchema: { country: z.enum(["kr","us","cn","jp","tw"]).describe("국가 코드"), market: z.enum(["google","apple"]).describe("마켓"), appType: z.enum(["app","game"]).describe("앱 구분"), rankType: z.enum(["all","free","paid","gross"]).optional(), startRank: z.number().optional(), endRank: z.number().optional() } }, async (p) => { const data = await callApi("/chart/market/realtime-rank", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });

  // ─── 사용량 ───
  server.registerTool("usage_rank", { description: "업종별 사용량 순위를 조회합니다.", inputSchema: { uType: z.enum(["user","device","install","time","avgTime"]).describe("순위 구분"), dateType: z.enum(["d","w","m"]).describe("조회 기간"), date: z.string().describe("조회일 (yyyymmdd)"), appCateMain: z.string().optional(), appCateSub: z.string().optional(), os: z.enum(["total","android","ios"]).optional(), gender: z.enum(["total","m","f"]).optional(), age: z.enum(["total","10","20","30","40","50","60"]).optional(), startRank: z.number().optional(), endRank: z.number().optional() } }, async (p) => { const data = await callApi("/usage/usage-rank", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("usage_rise_rank", { description: "급상승 앱 순위를 조회합니다.", inputSchema: { uType: z.enum(["user","time"]).describe("순위 구분"), dateType: z.enum(["d","w","m"]).describe("조회 기간"), date: z.string().describe("조회일 (yyyymmdd)"), os: z.enum(["total","android","ios"]).optional(), appCateMain: z.string().optional(), appCateSub: z.string().optional(), gender: z.enum(["total","m","f"]).optional(), age: z.enum(["total","10","20","30","40","50","60"]).optional(), startRank: z.number().optional(), endRank: z.number().optional() } }, async (p) => { const data = await callApi("/usage/rise-rank", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("usage_trend_traffic", { description: "업종 트래픽 트렌드를 분석합니다.", inputSchema: { tType: z.enum(["user","time","install"]).describe("트래픽 구분"), appCateSub: z.string().optional(), pkgName: z.string().optional(), dateType: z.enum(["d","w","m"]).describe("조회 기간"), startDate: z.string().describe("시작일 (yyyymmdd)"), endDate: z.string().describe("종료일 (yyyymmdd)"), os: z.enum(["total","android","ios"]).optional(), gender: z.enum(["total","m","f"]).optional(), age: z.enum(["total","10","20","30","40","50","60"]).optional() } }, async (p) => { const data = await callApi("/usage/trend/traffic", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("usage_overlap_rank", { description: "특정 앱 사용자가 동시에 사용하는 다른 앱 순위를 분석합니다.", inputSchema: { dateType: z.enum(["d","w","m"]).describe("조회 기간"), date: z.string().describe("조회일 (yyyymmdd)"), os: z.enum(["total","android","ios"]).optional(), pkgName: z.string().describe("분석할 앱의 패키지명"), appCateMain: z.string().optional().describe("업종 대분류 코드 (미입력 시 전체)"), appCateSub: z.string().optional().describe("업종 소분류 코드 (미입력 시 전체)"), startRank: z.number().optional(), endRank: z.number().optional() } }, async (p) => { p.appCateMain = p.appCateMain || "0"; p.appCateSub = p.appCateSub || "0"; const data = await callApi("/usage/overlap-rank", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });

  // ─── 앱 상세 ───
  server.registerTool("app_summary", { description: "특정 앱의 요약 데이터를 조회합니다 (MAU, DAU 등 핵심 지표).", inputSchema: { pkgName: z.string().describe("패키지명") } }, async ({ pkgName }) => { const data = await callApi("/apps/summary", { pkgName }); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_info", { description: "앱의 기본 정보를 조회합니다.", inputSchema: { pkgName: z.string().describe("패키지명") } }, async ({ pkgName }) => { const data = await callApi("/apps/info", { pkgName }); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_usage", { description: "특정 앱의 기간별 사용량을 분석합니다.", inputSchema: { uType: z.enum(["user","device","install","time"]).describe("사용량 구분"), pkgName: z.string().describe("패키지명"), dateType: z.enum(["d","w","m"]).describe("조회 기간"), startDate: z.string().describe("시작일 (yyyymmdd)"), endDate: z.string().describe("종료일 (yyyymmdd)"), os: z.enum(["total","android","ios"]).optional(), gender: z.enum(["total","m","f"]).optional(), age: z.enum(["total","10","20","30","40","50","60"]).optional() } }, async (p) => { const data = await callApi("/apps/usage", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_demographic", { description: "특정 앱의 성별/연령별 사용자 구성을 분석합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), dateType: z.enum(["d","w","m"]).describe("조회 기간"), startDate: z.string().describe("시작일 (yyyymmdd)"), endDate: z.string().describe("종료일 (yyyymmdd)"), os: z.enum(["total","android","ios"]).optional(), uType: z.enum(["user","time"]).describe("데이터 구분") } }, async (p) => { const data = await callApi("/apps/demographic", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_ranking_history", { description: "특정 앱의 순위 변동 히스토리를 조회합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), dateType: z.enum(["d","w","m"]).describe("조회 기간"), startDate: z.string().describe("시작일 (yyyymmdd)"), endDate: z.string().describe("종료일 (yyyymmdd)"), gender: z.enum(["total","m","f"]).optional(), age: z.enum(["total","10","20","30","40","50","60"]).optional(), rType: z.enum(["user","time"]).describe("사용량 구분") } }, async (p) => { const data = await callApi("/apps/ranking", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_biz_rate", { description: "특정 앱의 업종 내 점유율 히스토리를 조회합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), dateType: z.enum(["d","w","m"]).describe("조회 기간"), startDate: z.string().describe("시작일 (yyyymmdd)"), endDate: z.string().describe("종료일 (yyyymmdd)"), gender: z.enum(["total","m","f"]).optional(), age: z.enum(["total","10","20","30","40","50","60"]).optional(), bizCateType: z.enum(["main","sub"]).describe("업종 분류"), rType: z.enum(["user","time"]).describe("점유율 구분") } }, async (p) => { const data = await callApi("/apps/biz-rate", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_rate_total", { description: "앱의 구글 플레이 전체 평점을 조회합니다.", inputSchema: { pkgName: z.string().describe("패키지명") } }, async ({ pkgName }) => { const data = await callApi("/apps/rate-total", { pkgName }); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_rate", { description: "앱의 기간별 구글 플레이 평점 추이를 조회합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), dateType: z.enum(["d","w","m"]).describe("조회 기간"), startDate: z.string().describe("시작일 (yyyymmdd)"), endDate: z.string().describe("종료일 (yyyymmdd)") } }, async (p) => { const data = await callApi("/apps/rate", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });

  // ─── 심화 분석 ───
  server.registerTool("app_concurrent", { description: "특정 앱 사용자의 동시 사용 앱 수별 분포를 분석합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), date: z.string().describe("조회월 (yyyymm)"), os: z.enum(["total","android","ios"]).optional(), gender: z.enum(["total","m","f"]).optional(), age: z.enum(["total","10","20","30","40","50","60"]).optional() } }, async (p) => { const data = await callApi("/usage/app/concurrent", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_break", { description: "특정 앱의 이탈 고객을 분석합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), dateType: z.enum(["m","q"]).describe("조회 기간"), date: z.string().describe("조회월 (yyyymm)"), os: z.enum(["total","android","ios"]).optional(), gender: z.enum(["total","m","f"]).optional(), age: z.enum(["total","10","20","30","40","50","60"]).optional() } }, async (p) => { const data = await callApi("/usage/app/break", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_interest", { description: "특정 앱 사용자의 관심 업종을 분석합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), date: z.string().describe("조회월 (yyyymm)"), os: z.enum(["total","android","ios"]).optional() } }, async (p) => { const data = await callApi("/usage/app/interest", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_persona", { description: "특정 앱 사용자의 페르소나를 분석합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), date: z.string().describe("조회월 (yyyymm)") } }, async (p) => { const data = await callApi("/usage/app/persona", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("app_region", { description: "특정 앱 사용자의 지역 분포를 분석합니다.", inputSchema: { pkgName: z.string().describe("패키지명"), date: z.string().describe("조회월 (yyyymm)"), regionType: z.enum(["location","address"]).describe("지역 구분") } }, async (p) => { const data = await callApi("/usage/app/region", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });

  // ─── 경쟁앱 ───
  server.registerTool("competitor_install_delete", { description: "경쟁앱 간 신규 설치 건 삭제율을 비교합니다.", inputSchema: { pkgName: z.string().describe("패키지명 (여러 앱은 쉼표 구분)"), startDate: z.string().describe("시작일 (yyyymmdd)"), endDate: z.string().describe("종료일 (yyyymmdd)"), os: z.enum(["total","android","ios"]).optional() } }, async (p) => { const data = await callApi("/usage/competitor/install-delete", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("competitor_loyalty", { description: "경쟁앱 간 충성도를 비교합니다.", inputSchema: { pkgName: z.string().describe("패키지명 (여러 앱은 쉼표 구분)"), date: z.string().describe("조회월 (yyyymm)"), os: z.enum(["total","android","ios"]).optional() } }, async (p) => { const data = await callApi("/usage/competitor/loyalty", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });
  server.registerTool("competitor_retention", { description: "경쟁앱 간 재방문율을 비교합니다.", inputSchema: { pkgName: z.string().describe("패키지명 (여러 앱은 쉼표 구분)"), startDate: z.string().describe("시작일 (yyyymmdd)"), endDate: z.string().describe("종료일 (yyyymmdd)"), os: z.enum(["total","android","ios"]).optional() } }, async (p) => { const data = await callApi("/usage/retention", p); return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }; });

  return server;
}


// ─── HTTP + SSE 서버 ───
const transports = new Map();

const httpServer = http.createServer(async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  // 헬스체크
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", tools: 27 }));
    return;
  }

  // API 키 검증 (SSE, message 엔드포인트)
  if (req.url?.startsWith("/sse") || req.url?.startsWith("/message")) {
    if (!verifyApiKey(req)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid or missing API key" }));
      return;
    }
  }

  // SSE 연결
  if (req.method === "GET" && req.url === "/sse") {
    const server = createServer();
    const transport = new SSEServerTransport("/message", res);
    transports.set(transport.sessionId, { server, transport });
    res.on("close", () => { transports.delete(transport.sessionId); });
    await server.connect(transport);
    return;
  }

  // MCP 메시지 수신
  if (req.method === "POST" && req.url?.startsWith("/message")) {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const sessionId = url.searchParams.get("sessionId");
    const entry = sessionId ? transports.get(sessionId) : null;
    if (!entry) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Session not found" }));
      return;
    }
    await entry.transport.handlePostMessage(req, res);
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

httpServer.listen(PORT, () => {
  console.log(`✅ MobileIndex MCP SSE Server running on http://localhost:${PORT}`);
  console.log(`   SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   API keys: ${ALLOWED_KEYS.length > 0 ? `${ALLOWED_KEYS.length} key(s) configured` : "disabled (dev mode)"}`);
});
