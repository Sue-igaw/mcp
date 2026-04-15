import CodeBlock from "@/components/CodeBlock";
import Step from "@/components/Step";
import Callout from "@/components/Callout";
import SideNav from "@/components/SideNav";

const AUTO_APPROVE = `"autoApprove": [
        "search_app", "get_categories_main", "get_categories_sub",
        "chart_top_usage", "chart_top_revenue", "chart_market_rank",
        "chart_market_global_rank", "chart_market_realtime_rank",
        "usage_rank", "usage_rise_rank", "usage_trend_traffic", "usage_overlap_rank",
        "app_summary", "app_info", "app_usage", "app_demographic",
        "app_ranking_history", "app_biz_rate", "app_rate_total", "app_rate",
        "app_concurrent", "app_break", "app_interest", "app_persona", "app_region",
        "competitor_install_delete", "competitor_loyalty", "competitor_retention"
      ]`;

function Section({ id, title, badge, children }: { id: string; title: string; badge?: string; children: React.ReactNode }) {
  return (
    <section className="mb-16 scroll-mt-24" id={id}>
      <h2 className="text-[22px] font-bold text-mi-black mb-6">{title}{badge && <span className="inline-flex items-center text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-2 align-middle">{badge}</span>}</h2>
      {children}
    </section>
  );
}

function Divider() {
  return <hr className="border-mi-gray-100 my-14" />;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[16px] font-semibold text-mi-gray-900 mt-10 mb-3">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] text-mi-gray-700 mb-3 leading-relaxed">{children}</p>;
}

function IC({ children }: { children: string }) {
  return <code className="bg-mi-gray-100 text-mi-gray-900 px-1.5 py-0.5 rounded-md text-[13px] font-mono">{children}</code>;
}

function DevBadge() {
  return <span className="inline-flex items-center text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1.5">개발 필요</span>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="bg-mi-gray-50 text-mi-gray-700 font-semibold px-4 py-3 text-left text-[13px] border-b border-mi-gray-200">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-[14px] text-mi-gray-700 border-b border-mi-gray-100">{children}</td>;
}

export default function Page() {
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <main className="flex-1 max-w-3xl mx-auto px-6 lg:px-10 py-16">
        {/* 헤더 */}
        <header className="mb-16">
          <h1 className="text-[36px] font-extrabold text-mi-black tracking-tight leading-tight">모바일인덱스를 AI에 연결하세요</h1>
          <p className="text-[16px] text-mi-gray-500 mt-4 leading-relaxed">AI 플랫폼에서 자연어로 모바일인덱스 데이터를 조회할 수 있습니다.<br />아래 가이드를 따라 사용 중인 AI에 MCP를 연결하세요.</p>
        </header>

        {/* 시작하기 전에 */}
        <Section id="overview" title="시작하기 전에">
          <Callout>
            <strong>MCP란?</strong><br />Model Context Protocol의 약자로, AI가 외부 데이터를 직접 조회할 수 있게 해주는 표준 프로토콜입니다.<br />한 번 연결하면 &quot;카카오톡 MAU 알려줘&quot;처럼 자연어로 질문하는 것만으로 데이터를 받아볼 수 있습니다.
          </Callout>
          <H3>필요한 것</H3>
          <table className="w-full text-sm mb-4">
            <thead><tr><Th>항목</Th><Th>설명</Th></tr></thead>
            <tbody>
              <tr><Td><strong>모바일인덱스 API 키</strong></Td><Td>개인 이메일로 발급 예정</Td></tr>
              <tr><Td><strong>MCP 서버 URL</strong></Td><Td><IC>https://mcp.mobileindex.com</IC> <DevBadge /></Td></tr>
              <tr><Td><strong>AI 플랫폼</strong></Td><Td>Claude, ChatGPT, Kiro, Cursor, Windsurf 중 하나</Td></tr>
            </tbody>
          </table>
          <H3>연결 흐름</H3>
          <Step num={1}>모바일인덱스에서 요금제 선택 &amp; API 키 발급</Step>
          <Step num={2}>사용 중인 AI 플랫폼의 MCP 설정에 서버 URL + API 키 입력</Step>
          <Step num={3}>연결 완료 → AI에게 자연어로 데이터 요청</Step>
        </Section>

        <Divider />

        {/* Kiro */}
        <Section id="kiro" title="🏷️ Kiro IDE">
          <Callout>
            ⚠️ Kiro CLI는 현재 MCP를 지원하지 않아 연결이 불가합니다. Kiro IDE에서 사용해주세요.
          </Callout>
          <H3>설정 방법</H3>
          <P>프로젝트 루트에 <IC>.kiro/settings/mcp.json</IC> 파일을 생성하고 아래 내용을 붙여넣습니다.</P>
          <CodeBlock label=".kiro/settings/mcp.json">{`{
  "mcpServers": {
    "mobileindex": {
      "url": "https://mcp.mobileindex.com/sse",
      "headers": {
        "Authorization": "Bearer 여기에_API_키_입력"
      },
      ${AUTO_APPROVE}
    }
  }
}`}</CodeBlock>
          <H3>연결 확인</H3>
          <P>하단 패널의 MCP 서버 목록에서 <IC>mobileindex</IC>가 초록색(running) 상태인지 확인합니다.</P>
        </Section>

        <Divider />

        {/* Claude */}
        <Section id="claude" title="🏷️ Claude Desktop">
          <H3>설정 방법</H3>
          <Step num={1}>Claude Desktop에서 메뉴바 &gt; <strong>Claude</strong> &gt; <strong>Settings</strong></Step>
          <Step num={2}>좌측 <strong>Developer</strong> &gt; <strong>Edit Config</strong> 클릭</Step>
          <Step num={3}>아래 내용을 붙여넣고 저장</Step>
          <CodeBlock label="claude_desktop_config.json">{`{
  "mcpServers": {
    "mobileindex": {
      "url": "https://mcp.mobileindex.com/sse",
      "headers": {
        "Authorization": "Bearer 여기에_API_키_입력"
      }
    }
  }
}`}</CodeBlock>
          <P>기존 설정(<IC>preferences</IC> 등)이 있다면 전체를 덮어쓰지 말고,<br />같은 레벨에 <IC>mcpServers</IC> 블록만 추가하세요.</P>
          <Step num={4}>Claude Desktop <strong>완전히 종료 → 재시작</strong></Step>

          <H3>도구 자동 승인 (선택)</H3>
          <P>기본적으로 도구 호출 시마다 Allow 승인이 필요합니다.<br />매번 누르기 번거롭다면 <IC>autoApprove</IC>를 추가하세요.</P>
          <CodeBlock label="autoApprove 포함">{`{
  "mcpServers": {
    "mobileindex": {
      "url": "https://mcp.mobileindex.com/sse",
      "headers": {
        "Authorization": "Bearer 여기에_API_키_입력"
      },
      ${AUTO_APPROVE}
    }
  }
}`}</CodeBlock>

          <H3>연결 확인</H3>
          <P>채팅 입력창 하단에 🔨 아이콘 + 숫자가 보이면 성공입니다.<br />Settings &gt; Developer에서 <IC>mobileindex</IC> 옆에 초록색 running 뱃지도 확인할 수 있습니다.</P>
        </Section>

        {/* Claude CLI */}
        <Section id="claude-cli" title="🏷️ Claude CLI">
          <P>Claude CLI에서도 동일한 SSE 서버에 연결할 수 있습니다. 터미널에서 아래 명령어를 실행하세요.</P>
          <CodeBlock label="Claude CLI에서 MCP 서버 추가">{`claude mcp add mobileindex --transport sse --url https://mcp.mobileindex.com/sse --header "Authorization: Bearer 여기에_API_키_입력"`}</CodeBlock>
        </Section>

        <Divider />

        {/* ChatGPT, Cursor, Windsurf — 추후 추가 예정
        */}

        <Divider />

        {/* 도구 목록 */}
        <Section id="tools" title="사용 가능한 도구 목록">
          <Callout>
            총 28개 도구를 제공합니다. AI가 질문에 맞는 도구를 자동으로 선택하므로 도구명을 외울 필요는 없습니다.
          </Callout>
          {([
            { title: "공통", tools: [["search_app","앱 이름/패키지명으로 앱 검색"],["get_categories_main","업종 대분류 목록 조회"],["get_categories_sub","업종 소분류 목록 조회"]] },
            { title: "차트/순위", tools: [["chart_top_usage","통합 사용자 수 순위"],["chart_top_revenue","통합 매출 순위"],["chart_market_rank","마켓별 순위 (한국)"],["chart_market_global_rank","마켓별 순위 (글로벌 20개국)"],["chart_market_realtime_rank","실시간 마켓별 순위"]] },
            { title: "업종 사용량", tools: [["usage_rank","업종별 사용량 순위"],["usage_rise_rank","급상승 앱 순위"],["usage_trend_traffic","업종 트래픽 트렌드"],["usage_overlap_rank","동시 사용 앱 분석"]] },
            { title: "앱 상세 분석", tools: [["app_summary","앱 요약 데이터 (MAU, DAU 등)"],["app_info","앱 기본 정보"],["app_usage","기간별 사용량 분석"],["app_demographic","성별/연령별 사용자 구성"],["app_ranking_history","순위 변동 히스토리"],["app_biz_rate","업종 내 점유율"],["app_rate_total","구글 플레이 전체 평점"],["app_rate","기간별 평점 추이"]] },
            { title: "심화 분석", tools: [["app_concurrent","충성 고객 분석"],["app_break","이탈 고객 분석"],["app_interest","사용자 관심 업종"],["app_persona","사용자 페르소나"],["app_region","사용자 지역 분포"]] },
            { title: "경쟁앱 비교", tools: [["competitor_install_delete","신규 설치 건 삭제율 비교"],["competitor_loyalty","충성도 비교"],["competitor_retention","재방문율 비교"]] },
          ] as { title: string; tools: string[][] }[]).map((group) => (
            <div key={group.title}>
              <H3>{group.title}</H3>
              <table className="w-full text-sm mb-2">
                <thead><tr><Th>도구명</Th><Th>설명</Th></tr></thead>
                <tbody>
                  {group.tools.map(([name, desc]) => (
                    <tr key={name}>
                      <Td><IC>{name}</IC></Td>
                      <Td>{desc}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </Section>

        <Divider />

        {/* 사용 예시 */}
        <Section id="examples" title="사용 예시">
          <Callout>
            연동 후 AI에게 자연어로 질문하면 됩니다. 도구명이나 파라미터를 직접 입력할 필요가 없습니다.
          </Callout>
          <CodeBlock label="질의 예시">{`"카카오톡 MAU 알려줘"
"배달의민족 사용자 수 추이 보여줘"
"증권/투자 업종 사용자 수 순위 TOP 20"
"키움증권과 미래에셋 충성도 비교해줘"
"쿠팡 사용자의 성별/연령별 분포 분석해줘"
"이번 달 게임 매출 순위 TOP 10"
"네이버 사용자가 동시에 쓰는 앱 분석해줘"
"구글 플레이 무료 앱 순위 (미국)"`}</CodeBlock>
          <CodeBlock label="처리 흐름">{`질의 접수 → 앱 검색 → API 호출 → 데이터 수집 → 분석 결과 응답`}</CodeBlock>
        </Section>

        <Divider />

        {/* 트러블슈팅 */}
        <Section id="troubleshoot" title="트러블슈팅">
          <H3>연결이 안 될 때</H3>
          <table className="w-full text-sm mb-6">
            <thead><tr><Th>증상</Th><Th>원인</Th><Th>해결</Th></tr></thead>
            <tbody>
              <tr><Td>서버가 목록에 안 보임</Td><Td>JSON 문법 오류</Td><Td>쉼표, 중괄호, 따옴표 확인</Td></tr>
              <tr><Td>빨간색(error) 상태</Td><Td>URL 또는 API 키 오류</Td><Td>URL과 API 키 재확인</Td></tr>
              <tr><Td>설정 변경 미반영</Td><Td>앱 재시작 필요</Td><Td>완전 종료 후 재시작</Td></tr>
            </tbody>
          </table>

          <H3>API 호출 시 에러</H3>
          <table className="w-full text-sm mb-6">
            <thead><tr><Th>에러</Th><Th>원인</Th><Th>해결</Th></tr></thead>
            <tbody>
              <tr><Td><IC>401</IC></Td><Td>API 키 오류/만료</Td><Td>마이페이지에서 재확인</Td></tr>
              <tr><Td><IC>403</IC></Td><Td>요금제 미포함 기능</Td><Td>요금제 업그레이드</Td></tr>
              <tr><Td><IC>429</IC></Td><Td>호출 한도 초과</Td><Td>잠시 후 재시도</Td></tr>
            </tbody>
          </table>

          <H3>플랫폼별 재시작</H3>
          <table className="w-full text-sm mb-6">
            <thead><tr><Th>플랫폼</Th><Th>방법</Th></tr></thead>
            <tbody>
              <tr><Td>Claude Desktop</Td><Td>앱 완전 종료 후 재실행</Td></tr>
              <tr><Td>ChatGPT</Td><Td>Settings &gt; MCP Servers에서 재연결</Td></tr>
              <tr><Td>Kiro</Td><Td>자동 재연결 또는 MCP 서버 뷰에서 수동</Td></tr>
              <tr><Td>Cursor</Td><Td>Settings &gt; MCP에서 서버 재시작</Td></tr>
              <tr><Td>Windsurf</Td><Td>앱 재시작 또는 MCP 패널에서 재연결</Td></tr>
            </tbody>
          </table>

          <Callout>
            위 방법으로 해결되지 않으면 <IC>mi_help@igaworks.com</IC>으로 문의해주세요.
          </Callout>
        </Section>

        <footer className="text-center text-mi-gray-500 text-[12px] mt-16 pt-6 border-t border-mi-gray-100">
          모바일인덱스 MCP 연동 가이드 v1.0 · © IGAWorks
        </footer>
      </main>
    </div>
  );
}
