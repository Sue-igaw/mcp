#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = "https://data.mobileindex.com/v1/insight";
const API_TOKEN = process.env.MI_API_TOKEN || "";

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

const server = new McpServer({
  name: "mobileindex",
  version: "1.0.0",
});

// ─── 공통: 앱 검색 ───
server.registerTool(
  "search_app",
  { description: "앱 이름이나 패키지명으로 모바일인덱스에서 앱을 검색합니다. 다른 도구에서 pkgName이 필요할 때 먼저 이 도구로 검색하세요.", inputSchema: { keyword: z.string().min(2).describe("검색 키워드 (앱명 또는 패키지명, 2글자 이상)"), viewCnt: z.number().optional().describe("최대 출력 수 (기본 10)") } },
  async ({ keyword, viewCnt }) => {
    const data = await callApi("/common/search", { keyword, viewCnt });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 공통: 업종 대분류 ───
server.registerTool(
  "get_categories_main",
  { description: "업종 대분류 목록을 조회합니다. appCateMain 코드를 확인할 때 사용하세요.", inputSchema: {} },
  async () => {
    const data = await callApi("/common/cate-main");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 공통: 업종 소분류 ───
server.registerTool(
  "get_categories_sub",
  { description: "업종 소분류 목록을 조회합니다.", inputSchema: { appCateMain: z.string().describe("업종 대분류 코드") } },
  async ({ appCateMain }) => {
    const data = await callApi("/common/cate-sub", { appCateMain });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 차트: 사용자 수 순위 ───
server.registerTool(
  "chart_top_usage",
  { description: "통합 사용자 수 순위를 조회합니다. 전체/게임/일반앱 구분 가능.", inputSchema: {
    dateType: z.enum(["d", "w", "m"]).describe("조회 기간 (d:일간, w:주간, m:월간)"),
    date: z.string().describe("조회일 (yyyymmdd). 일간=날짜, 주간=월요일, 월간=1일"),
    appType: z.enum(["all", "app", "game"]).describe("앱 구분 (all:통합, app:일반앱, game:게임)"),
    startRank: z.number().optional().describe("시작 순위 (기본 1)"),
    endRank: z.number().optional().describe("끝 순위 (기본 100)"),
  } },
  async (params) => {
    const data = await callApi("/chart/top/usage", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 차트: 매출 순위 ───
server.registerTool(
  "chart_top_revenue",
  { description: "통합 매출 순위를 조회합니다.", inputSchema: {
    dateType: z.enum(["d", "w", "m"]).describe("조회 기간"),
    date: z.string().describe("조회일 (yyyymmdd)"),
    appType: z.enum(["all", "app", "game"]).describe("앱 구분"),
    startRank: z.number().optional(),
    endRank: z.number().optional(),
  } },
  async (params) => {
    const data = await callApi("/chart/top/revenue", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 차트: 마켓별 순위 (한국) ───
server.registerTool(
  "chart_market_rank",
  { description: "일간 마켓별 순위를 조회합니다 (대한민국). 구글/애플/원스토어 마켓 순위.", inputSchema: {
    market: z.enum(["google", "apple", "one"]).describe("마켓 (google/apple/one)"),
    date: z.string().describe("조회일 (yyyymmdd)"),
    appType: z.enum(["app", "game"]).describe("앱 구분"),
    rankType: z.enum(["all", "free", "paid", "gross"]).optional().describe("순위 구분"),
    startRank: z.number().optional(),
    endRank: z.number().optional(),
  } },
  async (params) => {
    const data = await callApi("/chart/market/rank", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 차트: 마켓별 순위 (글로벌) ───
server.registerTool(
  "chart_market_global_rank",
  { description: "일간 마켓별 순위를 조회합니다 (글로벌). 미국, 일본, 중국 등 20개국 지원.", inputSchema: {
    date: z.string().describe("조회일 (yyyymmdd)"),
    country: z.enum(["us","cn","jp","tw","sg","de","gb","in","ca","ru","th","id","my","hk","ph","tr","se","fr","au","es"]).describe("국가 코드"),
    market: z.enum(["google", "apple"]).describe("마켓"),
    appType: z.enum(["app", "game"]).describe("앱 구분"),
    rankType: z.enum(["all", "free", "paid", "gross"]).optional(),
    startRank: z.number().optional(),
    endRank: z.number().optional(),
  } },
  async (params) => {
    const data = await callApi("/chart/market/global-rank", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 차트: 실시간 마켓별 순위 ───
server.registerTool(
  "chart_market_realtime_rank",
  { description: "실시간 마켓별 순위를 조회합니다. 한국/미국/중국/일본/대만 지원.", inputSchema: {
    country: z.enum(["kr","us","cn","jp","tw"]).describe("국가 코드"),
    market: z.enum(["google", "apple"]).describe("마켓"),
    appType: z.enum(["app", "game"]).describe("앱 구분"),
    rankType: z.enum(["all", "free", "paid", "gross"]).optional(),
    startRank: z.number().optional(),
    endRank: z.number().optional(),
  } },
  async (params) => {
    const data = await callApi("/chart/market/realtime-rank", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 사용량: 업종 사용량 순위 ───
server.registerTool(
  "usage_rank",
  { description: "업종별 사용량 순위를 조회합니다. 사용자 수, 설치 기기, 사용 시간 등 다양한 지표로 순위 확인.", inputSchema: {
    uType: z.enum(["user","device","install","time","avgTime"]).describe("순위 구분 (user:사용자수, device:총설치기기, install:신규설치, time:총사용시간, avgTime:1인당평균사용시간)"),
    dateType: z.enum(["d","w","m"]).describe("조회 기간"),
    date: z.string().describe("조회일 (yyyymmdd)"),
    appCateMain: z.string().optional().describe("업종 대분류 코드 (0:전체)"),
    appCateSub: z.string().optional().describe("업종 소분류 코드 (0:전체)"),
    os: z.enum(["total","android","ios"]).optional().describe("OS 구분"),
    gender: z.enum(["total","m","f"]).optional().describe("성별"),
    age: z.enum(["total","10","20","30","40","50","60"]).optional().describe("연령대"),
    startRank: z.number().optional(),
    endRank: z.number().optional(),
  } },
  async (params) => {
    const data = await callApi("/usage/usage-rank", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 사용량: 급상승 순위 ───
server.registerTool(
  "usage_rise_rank",
  { description: "급상승 앱 순위를 조회합니다. 사용자 수 또는 사용 시간 기준 급상승 앱.", inputSchema: {
    uType: z.enum(["user","time"]).describe("순위 구분"),
    dateType: z.enum(["d","w","m"]).describe("조회 기간"),
    date: z.string().describe("조회일 (yyyymmdd)"),
    os: z.enum(["total","android","ios"]).optional(),
    appCateMain: z.string().optional(),
    appCateSub: z.string().optional(),
    gender: z.enum(["total","m","f"]).optional(),
    age: z.enum(["total","10","20","30","40","50","60"]).optional(),
    startRank: z.number().optional(),
    endRank: z.number().optional(),
  } },
  async (params) => {
    const data = await callApi("/usage/rise-rank", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 사용량: 업종 트래픽 분석 ───
server.registerTool(
  "usage_trend_traffic",
  { description: "업종 트래픽 트렌드를 분석합니다. 사용자 수, 사용 시간, 신규 설치 추이.", inputSchema: {
    tType: z.enum(["user","time","install"]).describe("트래픽 구분 (user:사용자수, time:사용시간, install:신규설치)"),
    appCateSub: z.string().optional().describe("업종 소분류 코드"),
    pkgName: z.string().optional().describe("패키지명 (특정 앱 지정 시)"),
    dateType: z.enum(["d","w","m"]).describe("조회 기간"),
    startDate: z.string().describe("시작일 (yyyymmdd)"),
    endDate: z.string().describe("종료일 (yyyymmdd)"),
    os: z.enum(["total","android","ios"]).optional(),
    gender: z.enum(["total","m","f"]).optional(),
    age: z.enum(["total","10","20","30","40","50","60"]).optional(),
  } },
  async (params) => {
    const data = await callApi("/usage/trend/traffic", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 사용량: 동시 사용 앱 분석 ───
server.registerTool(
  "usage_overlap_rank",
  { description: "특정 앱 사용자가 동시에 사용하는 다른 앱 순위를 분석합니다.", inputSchema: {
    dateType: z.enum(["d","w","m"]).describe("조회 기간"),
    date: z.string().describe("조회일 (yyyymmdd)"),
    os: z.enum(["total","android","ios"]).optional(),
    pkgName: z.string().describe("분석할 앱의 패키지명"),
    appCateMain: z.string().optional(),
    appCateSub: z.string().optional(),
    startRank: z.number().optional(),
    endRank: z.number().optional(),
  } },
  async (params) => {
    params.appCateMain = params.appCateMain || "0";
    params.appCateSub = params.appCateSub || "0";
    const data = await callApi("/usage/overlap-rank", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 앱 상세: 앱 정보 요약 ───
server.registerTool(
  "app_summary",
  { description: "특정 앱의 요약 데이터를 조회합니다 (MAU, DAU 등 핵심 지표).", inputSchema: { pkgName: z.string().describe("패키지명 (예: com.kakao.talk)") } },
  async ({ pkgName }) => {
    const data = await callApi("/apps/summary", { pkgName });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 앱 상세: 앱 기본 정보 ───
server.registerTool(
  "app_info",
  { description: "앱의 기본 정보를 조회합니다 (앱명, 퍼블리셔, 카테고리 등).", inputSchema: { pkgName: z.string().describe("패키지명") } },
  async ({ pkgName }) => {
    const data = await callApi("/apps/info", { pkgName });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 앱 상세: 사용량 분석 ───
server.registerTool(
  "app_usage",
  { description: "특정 앱의 기간별 사용량을 분석합니다. 사용자 수, 사용 시간, 활성 기기, 신규 설치 추이.", inputSchema: {
    uType: z.enum(["user","device","install","time"]).describe("사용량 구분 (user:사용자수, time:사용시간, device:활성기기, install:신규설치)"),
    pkgName: z.string().describe("패키지명"),
    dateType: z.enum(["d","w","m"]).describe("조회 기간"),
    startDate: z.string().describe("시작일 (yyyymmdd)"),
    endDate: z.string().describe("종료일 (yyyymmdd)"),
    os: z.enum(["total","android","ios"]).optional(),
    gender: z.enum(["total","m","f"]).optional(),
    age: z.enum(["total","10","20","30","40","50","60"]).optional(),
  } },
  async (params) => {
    const data = await callApi("/apps/usage", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 앱 상세: 데모그래픽 분석 ───
server.registerTool(
  "app_demographic",
  { description: "특정 앱의 성별/연령별 사용자 구성 또는 사용 시간 구성을 분석합니다.", inputSchema: {
    pkgName: z.string().describe("패키지명"),
    dateType: z.enum(["d","w","m"]).describe("조회 기간"),
    startDate: z.string().describe("시작일 (yyyymmdd)"),
    endDate: z.string().describe("종료일 (yyyymmdd)"),
    os: z.enum(["total","android","ios"]).optional(),
    uType: z.enum(["user","time"]).describe("데이터 구분 (user:사용자구성, time:연령별사용시간)"),
  } },
  async (params) => {
    const data = await callApi("/apps/demographic", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 앱 상세: 순위 히스토리 ───
server.registerTool(
  "app_ranking_history",
  { description: "특정 앱의 기간별 순위 변동 히스토리를 조회합니다.", inputSchema: {
    pkgName: z.string().describe("패키지명"),
    dateType: z.enum(["d","w","m"]).describe("조회 기간"),
    startDate: z.string().describe("시작일 (yyyymmdd)"),
    endDate: z.string().describe("종료일 (yyyymmdd)"),
    gender: z.enum(["total","m","f"]).optional(),
    age: z.enum(["total","10","20","30","40","50","60"]).optional(),
    rType: z.enum(["user","time"]).describe("사용량 구분 (user:사용자수, time:사용시간)"),
  } },
  async (params) => {
    const data = await callApi("/apps/ranking", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 앱 상세: 점유율 히스토리 ───
server.registerTool(
  "app_biz_rate",
  { description: "특정 앱의 업종 내 점유율 히스토리를 조회합니다.", inputSchema: {
    pkgName: z.string().describe("패키지명"),
    dateType: z.enum(["d","w","m"]).describe("조회 기간"),
    startDate: z.string().describe("시작일 (yyyymmdd)"),
    endDate: z.string().describe("종료일 (yyyymmdd)"),
    gender: z.enum(["total","m","f"]).optional(),
    age: z.enum(["total","10","20","30","40","50","60"]).optional(),
    bizCateType: z.enum(["main","sub"]).describe("업종 분류 (main:대분류, sub:소분류)"),
    rType: z.enum(["user","time"]).describe("점유율 구분 (user:사용자점유율, time:사용시간점유율)"),
  } },
  async (params) => {
    const data = await callApi("/apps/biz-rate", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 앱 상세: 평점 (Total) ───
server.registerTool(
  "app_rate_total",
  { description: "앱의 구글 플레이 전체 평점을 조회합니다.", inputSchema: { pkgName: z.string().describe("패키지명") } },
  async ({ pkgName }) => {
    const data = await callApi("/apps/rate-total", { pkgName });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 앱 상세: 기간별 평점 ───
server.registerTool(
  "app_rate",
  { description: "앱의 기간별 구글 플레이 평점 추이를 조회합니다.", inputSchema: {
    pkgName: z.string().describe("패키지명"),
    dateType: z.enum(["d","w","m"]).describe("조회 기간"),
    startDate: z.string().describe("시작일 (yyyymmdd)"),
    endDate: z.string().describe("종료일 (yyyymmdd)"),
  } },
  async (params) => {
    const data = await callApi("/apps/rate", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 심화 분석: 충성 고객 (사용 앱 수별 분포) ───
server.registerTool(
  "app_concurrent",
  { description: "특정 앱 사용자의 동시 사용 앱 수별 분포를 분석합니다 (충성 고객 분석).", inputSchema: {
    pkgName: z.string().describe("패키지명"),
    date: z.string().describe("조회월 (yyyymm)"),
    os: z.enum(["total","android","ios"]).optional(),
    gender: z.enum(["total","m","f"]).optional(),
    age: z.enum(["total","10","20","30","40","50","60"]).optional(),
  } },
  async (params) => {
    const data = await callApi("/usage/app/concurrent", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 심화 분석: 이탈 고객 분석 ───
server.registerTool(
  "app_break",
  { description: "특정 앱의 이탈 고객을 분석합니다.", inputSchema: {
    pkgName: z.string().describe("패키지명"),
    dateType: z.enum(["m","q"]).describe("조회 기간 (m:1개월, q:3개월)"),
    date: z.string().describe("조회월 (yyyymm)"),
    os: z.enum(["total","android","ios"]).optional(),
    gender: z.enum(["total","m","f"]).optional(),
    age: z.enum(["total","10","20","30","40","50","60"]).optional(),
  } },
  async (params) => {
    const data = await callApi("/usage/app/break", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 심화 분석: 관심 업종 분석 ───
server.registerTool(
  "app_interest",
  { description: "특정 앱 사용자의 관심 업종을 분석합니다.", inputSchema: {
    pkgName: z.string().describe("패키지명"),
    date: z.string().describe("조회월 (yyyymm)"),
    os: z.enum(["total","android","ios"]).optional(),
  } },
  async (params) => {
    const data = await callApi("/usage/app/interest", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 심화 분석: 페르소나 분석 ───
server.registerTool(
  "app_persona",
  { description: "특정 앱 사용자의 페르소나를 분석합니다 (절대값).", inputSchema: {
    pkgName: z.string().describe("패키지명"),
    date: z.string().describe("조회월 (yyyymm)"),
  } },
  async (params) => {
    const data = await callApi("/usage/app/persona", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 심화 분석: 지역 분석 ───
server.registerTool(
  "app_region",
  { description: "특정 앱 사용자의 지역 분포를 분석합니다 (활동 지역 또는 거주 지역).", inputSchema: {
    pkgName: z.string().describe("패키지명"),
    date: z.string().describe("조회월 (yyyymm)"),
    regionType: z.enum(["location","address"]).describe("지역 구분 (location:활동지역, address:거주지역)"),
  } },
  async (params) => {
    const data = await callApi("/usage/app/region", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 경쟁앱: 신규 설치 건 삭제율 ───
server.registerTool(
  "competitor_install_delete",
  { description: "경쟁앱 간 신규 설치 건 삭제율을 비교합니다. pkgName에 쉼표로 여러 앱 지정 가능.", inputSchema: {
    pkgName: z.string().describe("패키지명 (여러 앱은 쉼표 구분)"),
    startDate: z.string().describe("시작일 (yyyymmdd)"),
    endDate: z.string().describe("종료일 (yyyymmdd)"),
    os: z.enum(["total","android","ios"]).optional(),
  } },
  async (params) => {
    const data = await callApi("/usage/competitor/install-delete", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 경쟁앱: 충성도 비교 ───
server.registerTool(
  "competitor_loyalty",
  { description: "경쟁앱 간 성별/연령별 충성도를 비교합니다.", inputSchema: {
    pkgName: z.string().describe("패키지명 (여러 앱은 쉼표 구분)"),
    date: z.string().describe("조회월 (yyyymm)"),
    os: z.enum(["total","android","ios"]).optional(),
  } },
  async (params) => {
    const data = await callApi("/usage/competitor/loyalty", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 경쟁앱: 리텐션 (재방문율) ───
server.registerTool(
  "competitor_retention",
  { description: "경쟁앱 간 신규 설치 건 재방문율을 비교합니다.", inputSchema: {
    pkgName: z.string().describe("패키지명 (여러 앱은 쉼표 구분)"),
    startDate: z.string().describe("시작일 (yyyymmdd, 주간 시작일=월요일)"),
    endDate: z.string().describe("종료일 (yyyymmdd, 주간 종료일=일요일)"),
    os: z.enum(["total","android","ios"]).optional(),
  } },
  async (params) => {
    const data = await callApi("/usage/retention", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ─── 서버 시작 ───
const transport = new StdioServerTransport();
await server.connect(transport);

