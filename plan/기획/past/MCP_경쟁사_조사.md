# MCP 경쟁사 조사

> 모바일인덱스 경쟁사 및 자사 서비스(디파이너리/트레이딩웍스) 경쟁사의 MCP 제공 현황을 상세 조사한 문서입니다.
> 제공 도구 목록, 상품 구조, 연결 방식, 과금, 보안 정책 등을 포함합니다.

<br>

---

## 1. 시밀러웹 (SimilarWeb)

### 기본 정보

| 항목 | 내용 |
|------|------|
| 출시일 | 2025년 9월 |
| 상태 | 정식 출시 |
| 엔드포인트 | `https://mcp.similarweb.com` |
| 과금 | 별도 MCP 요금 없음. 기존 API 구독에 포함. MCP 호출도 기존 Data Credits 차감 |
| 필요 플랜 | API-only, Business($35,000/년~), Enterprise |
| 인증 | API 키 기반 (기존 Similarweb API 키 그대로 사용, HTTP 헤더 `api-key`) |
| 보안 | HTTPS 필수, 읽기 전용 |

### 지원 AI 플랫폼

| 플랫폼 | 지원 여부 | 비고 |
|--------|----------|------|
| Claude Desktop | ✅ | 공식 가이드 제공 |
| Cursor | ✅ | 공식 가이드 제공 |
| Microsoft Copilot Studio | ✅ | 공식 가이드 제공 (MCP Tool로 연결) |
| Zapier | ✅ | 노코드 자동화 연동 |
| n8n | ✅ | 노코드 자동화 연동 |
| ChatGPT | 명시 없음 | 공식 문서에 별도 가이드 없음 |

### 상품 페이지 구성

시밀러웹 MCP 상품 페이지(`similarweb.com/corp/ai/mcp`)의 구성:

```
① 히어로 섹션: "All the insights you need, right where you need them"
② 4가지 활용 영역 소개:
   - 웹사이트/키워드 분석
   - 앱 마켓 리서치
   - 아마존 마켓플레이스 분석
   - 리드 발굴/강화
③ 3가지 사용 방식:
   - LLM에서 온디맨드 인사이트 (Claude, ChatGPT, Copilot)
   - 커스텀 AI 에이전트 구축
   - 개발자용 애플리케이션 (대시보드, 자동 리포팅)
④ 직군별 활용 시나리오:
   - 에이전시: 경쟁 분석 리포트, 신규 비즈니스 제안서
   - AI/데이터팀: AI 모델에 실제 시장 데이터 공급
   - 리서치/분석: 시장 규모 추정, 경쟁사 식별
   - 마케팅/SEO: 키워드 리서치, 순위 모니터링 자동화
⑤ 고객 사례 (ShopVision)
⑥ FAQ
```

### 제공 도구 상세 — 웹사이트 분석 (18개)

| # | 도구명 | 설명 | 주요 메트릭 |
|---|--------|------|-----------|
| 1 | Traffic and Engagement | 특정 웹사이트의 트래픽/참여 지표 시계열 | visits, avg_visit_duration, pages_per_visit, bounce_rate, page_views, unique_visitors, new_users, returning_users |
| 2 | Traffic Sources | 마케팅 채널별 트래픽 분석 (direct, display, mail, organic, paid, referral, social) | visits, avg_visit_duration, pages_per_visit, bounce_rate |
| 3 | Website Rank | 웹사이트 순위 시계열 | country_rank, category, category_rank |
| 4 | Subdomains | 서브도메인별 트래픽 점유율 | subdomain, share |
| 5 | Similar Sites | 유사 웹사이트 (유사 오디언스/트래픽 패턴) | rank, affinity, has_adsense |
| 6 | Referrals | 유입/유출 레퍼럴 웹사이트 | share, change |
| 7 | Audience Interests | 오디언스 관심사 (함께 방문하는 사이트) | affinity, overlap, pop_change, has_adsense, domain |
| 8 | Audience Overlap | 2~5개 웹사이트 간 오디언스 중복 분석 | overlap, union |
| 9 | Deduplicated Audience | 중복 제거 오디언스 (데스크톱/모바일 구분) | total_deduplicated_audience, desktop_only_share, mobile_web_only_share 등 |
| 10 | Leading Folders | 주요 폴더별 트래픽 점유율 | folder, share, change |
| 11 | Popular Pages | 인기 페이지 | share, change |
| 12 | PPC Spend | 월별 유료 검색 광고비 | ppc_spend |
| 13 | Segment Traffic and Engagement | 웹사이트 특정 세그먼트의 트래픽/참여 시계열 | visits, bounce_rate, page_views, avg_visit_duration, pages_per_visit, share, unique_visitors |
| 14 | Segment Traffic Sources | 세그먼트별 채널 분석 | visits, bounce_rate, page_views, avg_visit_duration, pages_per_visit |
| 15 | Ad Networks | 광고 네트워크 데이터 (유입/유출) | share, visits |
| 16 | Geography | 국가별 트래픽/참여 분석 | country, country_name, rank, share, visits, avg_visit_duration, pages_per_visit, bounce_rate |
| 17 | Technologies | 웹사이트가 사용하는 기술 스택 | sub_category, pricing_model, description, first_seen_date |
| 18 | Demographics | 인구통계 (성별/연령대) | age_18_to_24_share ~ age_65_plus_share, male_share, female_share |

추가로 Traffic by Demographics 도구가 있음 (특정 인구통계 그룹의 트래픽 지표: share, pages_per_visit, bounce_rate, visit_duration)

### 제공 도구 상세 — 검색 분석 (2개)

| # | 도구명 | 설명 | 주요 메트릭 |
|---|--------|------|-----------|
| 1 | SERP Players | 특정 키워드/키워드 그룹의 검색 트래픽 상위 웹사이트 | site, domain_name, clicks, traffic_share, serp_features, position, top_url |
| 2 | SERP Clicks | 키워드별 상위 웹사이트의 클릭 추이 시계열 | site, domain_name, clicks, traffic_share, serp_features, position, top_url |

### 제공 도구 상세 — 앱 분석 (3개)

| # | 도구명 | 설명 | 주요 메트릭 |
|---|--------|------|-----------|
| 1 | App Install Penetration | 특정 국가에서 앱 설치 비율 | installs % |
| 2 | App Store Rank | 앱스토어 순위 시계열 | Android/iOS store ranks |
| 3 | App Details | 앱 상세 정보 | title, image, publisher, price, main_category, main_category_id, rating |

### 도구 요약

| 카테고리 | 도구 수 | 데이터 특성 |
|----------|--------|-----------|
| 웹사이트 분석 | 18개 (+1) | 웹 트래픽, 오디언스, 채널, 광고, 기술 스택 |
| 검색 분석 | 2개 | SERP 순위, 키워드 클릭 |
| 앱 분석 | 3개 | 설치율, 스토어 순위, 앱 기본 정보 |
| **합계** | **23개** | |

### 과금 구조

```
MCP 호출 = 기존 API와 동일한 Data Credits 차감
복잡한 질의(여러 데이터 타입 조회) = 더 많은 Credits 소모
```

> ⚠️ "MCP uses the same data credits as standard API calls. Credit consumption varies based on your prompts and which data endpoints the AI agent accesses."
> ([출처: Similarweb MCP 개발자 문서](https://developers.similarweb.com/docs/similarweb-mcp))

### 공식 프롬프트 예시

시밀러웹이 공식 문서에서 제공하는 프롬프트 템플릿:

**1. 경쟁 분석 대시보드**
```
Create a competitive analysis dashboard for [your-domain.com] vs. [competitor1.com], [competitor2.com], and [competitor3.com]. Include:
- Traffic volume and growth trends (last 6 months)
- Audience demographics and geographic distribution
- Traffic source breakdown and channel performance
- Popular content and site structure comparison
- Technology stack and advertising analysis
Provide strategic recommendations based on the data.
```

**2. 트래픽 소스 분석**
```
Break down traffic sources for [domain.com] compared to industry benchmarks:
- Organic vs. paid search performance
- Social media and referral effectiveness
- Direct traffic trends and brand awareness
- Channel optimization recommendations
```

**3. 시장 리서치**
```
Research the [industry/category] market:
- Identify top 10 websites by traffic volume
- Analyze audience overlap between market leaders
- Examine geographic distribution patterns
- Assess competitive positioning opportunities for [your-domain.com]
```

<br>

---

## 2. AppsFlyer

### 기본 정보

| 항목 | 내용 |
|------|------|
| 출시일 | 2025년 7월 (베타) |
| 상태 | 베타 (전체 사용자 오픈) |
| 엔드포인트 | `https://mcp.appsflyer.com/auth/mcp` |
| 과금 | 기존 구독에 포함 (별도 MCP 요금 없음) |
| 필요 플랜 | AppsFlyer 계정 필요 (무료 플랜 포함 여부 불명확) |
| 인증 | OAuth 로그인 (Claude/ChatGPT) 또는 Bearer Token (자동화 도구) |
| 보안 | 데이터 암호화, 실시간 처리(저장 안 함), 사용자 역할 기반 접근 제어, SOC 2 Type 2/ISO 인증 |

### 지원 AI 플랫폼

| 플랫폼 | 지원 여부 | 비고 |
|--------|----------|------|
| Claude (웹/데스크톱) | ✅ | Pro, Max, Team, Enterprise. OAuth 로그인 |
| ChatGPT | ✅ | 전체 유료 플랜. Custom GPT + MCP 커넥터 두 가지 방식 |
| Cursor IDE | ✅ | 프로젝트별/글로벌 설정 가능 |
| VS Code | ✅ | Copilot Chat 연동 |
| Gemini CLI | ✅ | 터미널 환경 |
| n8n / Make.com | ✅ | Bearer Token 인증. 워크플로우 템플릿 제공 |
| 기타 | 요청 시 | CSM 또는 hello@appsflyer.com 연락 |

### 상품 페이지 구성

AppsFlyer MCP 상품 페이지(`appsflyer.com/products/agentic-ai/mcp/`)의 구성:

```
① 히어로: "Your data team is busy. Your LLM isn't."
② 3가지 핵심 가치:
   - 필요한 메트릭을 정확히 질의 (ROAS, retention, LTV)
   - 핵심 마케팅 워크플로우 가속화
   - 업계 최고 수준의 데이터 보안
③ 6가지 유스케이스:
   - 캠페인 성과 분석
   - 커스텀 에이전트/자동화 구축
   - OneLink 감사
   - 오디언스 관리
   - 앱 설정 확인
   - SDK/제품 문서 조회
④ FAQ
⑤ CTA: "Join the MCP Beta"
```

### 제공 도구 상세 — 카테고리별

AppsFlyer MCP는 도구를 "카테고리"로 분류하며, 각 카테고리에 여러 도구가 포함됩니다.

| # | 카테고리 | 설명 | 주요 질의 예시 |
|---|---------|------|--------------|
| 1 | Analyze Performance | 실시간 마케팅 성과 데이터 탐색. 캠페인 비교, 트렌드 발견, 인사이트 도출 | "지난주 미국에서 Top 미디어 소스는?", "ROAS 기준 최고 캠페인은?", "어제 중국 설치 수는?" |
| 2 | Analyze SKAN Performance | iOS SKAdNetwork 캠페인 성과 분석. KPI 트렌드 및 네트워크별 ROI | "지난달 네트워크별 ROI는?", "CPI가 가장 낮은 캠페인은?", "주간 전환율 추이는?" |
| 3 | OneLink Management | OneLink 템플릿/링크 감사 및 트러블슈팅 | "HolidayPush2025 템플릿의 모든 링크와 파라미터 보여줘", "이 OneLink가 기존 사용자에게 앱스토어로 리다이렉트하는 이유는?" |
| 4 | Knowledge Base & Developer Support | AppsFlyer 문서/DevHub 리소스 빠른 접근 | "Android에서 인앱 이벤트 중복 제거 설정 방법은?", "TikTok 설치의 어트리뷰션 룩백 윈도우는?" |
| 5 | Apps Management | 앱 설정 정보 조회 (어트리뷰션 윈도우, 세션 타임아웃, 리인게이지먼트 설정 등) | "게이밍 앱들의 어트리뷰션 윈도우 설정은?", "룩백 윈도우가 다른 앱은?", "활성 iOS 핀 앱 목록은?" |
| 6 | Audiences Management | 오디언스 구조, 소유자, 파트너 연결, 활성 테스트 가시성 | "FinancePro 앱의 활성 오디언스 전부 보여줘", "Churned Users - Tier A를 마지막으로 수정한 사람은?", "Meta/TikTok 스플릿 테스트 중인 오디언스는?" |
| 7 | Feedback Tool | MCP 사용 경험 피드백 제출 | "분석 도구 좋았어요, 인앱 이벤트 측정도 추가해주세요" |
| 8 | Cost Configuration | 비용 데이터 통합 관리. 비용 커버리지 극대화, 통합 갭 감지 | "활성 비용 통합 목록은?", "비용 통합에 이슈가 있는 것은?", "어트리뷰션 데이터 기반으로 연결해야 할 비용 통합은?" |
| 9 | Ad Revenue Integrations | 광고 수익 통합 관리 | "활성 광고 수익 통합 목록은?", "광고 수익 통합에 이슈가 있는 것은?" |
| 10 | User Management & Role Control | 계정 관리. 사용자/역할 정보 조회 | "6개월 이상 미로그인 사용자는?", "권한 레벨별 사용자 그룹은?", "5개 이상 앱에 접근 가능한 사용자는?" |

### 인증 방식 상세

AppsFlyer는 두 가지 인증 방식을 제공합니다:

**1. OAuth 로그인 (Claude, ChatGPT 등 LLM 플랫폼)**
```
사용자가 AI 플랫폼에서 AppsFlyer 커넥터 추가
→ AppsFlyer 로그인 페이지로 리다이렉트
→ 기존 AppsFlyer 계정으로 로그인
→ 연결 완료 (10시간마다 재인증 필요)
```

**2. Bearer Token (n8n, Make.com 등 자동화 도구)**
```
AppsFlyer → Security Center → AppsFlyer Tokens에서 MCP 토큰 생성
→ 자동화 도구에 Base URL + Bearer Token 입력
→ 연결 완료
```

### ChatGPT 연동 — 두 가지 방식

| 방식 | 대상 | 설명 |
|------|------|------|
| Custom GPT | 무료 포함 전체 플랜 | AppsFlyer 전용 GPT를 사이드바에 추가. 원클릭 |
| MCP 커넥터 | 유료 플랜 (Pro, Business, Enterprise) | 모든 ChatGPT 대화에서 AppsFlyer 데이터 접근 가능 |

### 특이사항

- **오픈소스**: GitHub에 MCP 서버 코드 공개
- **워크플로우 템플릿**: n8n용 자동화 워크플로우 2개를 GitHub에 공개 (주간 리포트, 예산 알림)
- **Custom GPT**: ChatGPT 무료 사용자도 접근 가능한 전용 GPT 제공
- **피드백 도구**: MCP 내에 피드백 제출 도구를 내장 (사용자가 AI 대화 중 바로 피드백 가능)
- **보안 10시간 자동 만료**: Claude/ChatGPT 연결은 10시간마다 재인증 필요


<br>

---

## 3. Braze

### 기본 정보

| 항목 | 내용 |
|------|------|
| 출시일 | 2025년 6월 (베타) |
| 상태 | 베타 (전체 고객 접근 가능, 별도 신청 불필요) |
| 설치 방식 | 로컬 MCP 서버 (npm 패키지 설치) |
| 과금 | 기존 구독에 포함 (별도 MCP 요금 없음) |
| 인증 | Braze REST API 키 (전용 키 생성 권장) + REST API Base URL |
| 보안 | 읽기 전용(read-only), 비PII 데이터만 반환, 전용 API 키 생성 강력 권장 |

### 지원 AI 플랫폼

| 플랫폼 | 지원 여부 | 비고 |
|--------|----------|------|
| Claude Desktop | ✅ | Anthropic 공식 연동 가이드 제공 |
| Cursor | ✅ | |
| VS Code | ✅ | |
| 기타 MCP 클라이언트 | ✅ | MCP 프로토콜 지원하는 모든 클라이언트 |

### 상품 페이지 구성

Braze MCP 소개 블로그(`braze.com/resources/articles/introducing-braze-mcp-server`)의 구성:

```
① 도입: "If you can type a question, you can explore your Braze ecosystem"
② 설치 가이드: 10분 이내 설정 완료
③ 내부 사용 사례: Braze 마케팅팀이 직접 사용한 경험 공유
   - FY별 캠페인/캔버스 수 추이
   - 7월 캠페인 성과 요약
   - 시작/계속/중단할 것 추천
   - 180개 중복 커스텀 속성 발견
④ Pro Tips: 구체적 질문, 부분 데이터 주의, 루프 탈출법, 우선순위 요청법
⑤ CTA: 문서 링크
```

### 제공 도구 상세 — 38개 API 함수 (15개 카테고리)

**일반 함수 (2개)**

| # | 함수명 | 설명 |
|---|--------|------|
| 1 | list_functions | 사용 가능한 모든 Braze API 함수 목록 조회 |
| 2 | call_function | 특정 Braze API 함수 호출 |

**Campaigns (3개)**

| # | 함수명 | 엔드포인트 | 설명 |
|---|--------|----------|------|
| 1 | get_campaign_list | /campaigns/list | 캠페인 목록 + 메타데이터 |
| 2 | get_campaign_details | /campaigns/details | 특정 캠페인 상세 정보 |
| 3 | get_campaign_dataseries | /campaigns/data_series | 캠페인 시계열 분석 데이터 |

**Canvases (4개)**

| # | 함수명 | 엔드포인트 | 설명 |
|---|--------|----------|------|
| 1 | get_canvas_list | /canvas/list | 캔버스 목록 + 메타데이터 |
| 2 | get_canvas_details | /canvas/details | 특정 캔버스 상세 정보 |
| 3 | get_canvas_data_summary | /canvas/data_summary | 캔버스 성과 요약 분석 |
| 4 | get_canvas_data_series | /canvas/data_series | 캔버스 시계열 분석 데이터 |

**Segments (3개)**

| # | 함수명 | 엔드포인트 | 설명 |
|---|--------|----------|------|
| 1 | get_segment_list | /segments/list | 세그먼트 목록 (분석 추적 상태 포함) |
| 2 | get_segment_data_series | /segments/data_series | 세그먼트 시계열 분석 데이터 |
| 3 | get_segment_details | /segments/details | 특정 세그먼트 상세 정보 |

**Events (3개)**

| # | 함수명 | 엔드포인트 | 설명 |
|---|--------|----------|------|
| 1 | get_events_list | /events/list | 커스텀 이벤트 목록 |
| 2 | get_events_data_series | /events/data_series | 커스텀 이벤트 시계열 데이터 |
| 3 | get_events | /events | 이벤트 상세 데이터 (페이지네이션 지원) |

**Custom Attributes (1개)**

| # | 함수명 | 엔드포인트 | 설명 |
|---|--------|----------|------|
| 1 | get_custom_attributes | /custom_attributes | 앱에 기록된 커스텀 속성 목록 |

**Sessions (1개)**

| # | 함수명 | 엔드포인트 | 설명 |
|---|--------|----------|------|
| 1 | get_session_data_series | /sessions/data_series | 앱 세션 수 시계열 데이터 |

**Sends (1개)**

| # | 함수명 | 엔드포인트 | 설명 |
|---|--------|----------|------|
| 1 | get_send_data_series | /sends/data_series | 추적된 캠페인 발송의 일별 분석 |

**Subscription (2개)**

| # | 함수명 | 엔드포인트 | 설명 |
|---|--------|----------|------|
| 1 | get_user_subscription_groups | /subscription/user/status | 특정 사용자의 구독 그룹 목록/상태 |
| 2 | get_subscription_group_status | /subscription/status/get | 구독 그룹 내 사용자 구독 상태 |

**기타 카테고리 (도구 수 미공개)**

| 카테고리 | 설명 |
|----------|------|
| Catalogs | 카탈로그 데이터 |
| Cloud Data Ingestion | 클라우드 데이터 수집 |
| Content Blocks | 콘텐츠 블록 |
| KPIs | 핵심 성과 지표 |
| Messages | 메시지 |
| Preference Centers | 선호도 센터 |
| Purchases | 구매 데이터 |
| Templates | 템플릿 |
| SDK Authentication Keys | SDK 인증 키 |

> 📌 Braze 공식 문서에서 위 카테고리들은 섹션 제목만 있고 상세 함수가 공개되지 않은 상태입니다.
> 전체 38개 중 위에서 확인된 것은 20개이며, 나머지는 위 카테고리에 분산되어 있습니다.

### 도구 요약

| 카테고리 | 확인된 도구 수 | 비고 |
|----------|-------------|------|
| 일반 | 2개 | list_functions, call_function |
| Campaigns | 3개 | |
| Canvases | 4개 | |
| Segments | 3개 | |
| Events | 3개 | |
| Custom Attributes | 1개 | |
| Sessions | 1개 | |
| Sends | 1개 | |
| Subscription | 2개 | |
| 기타 9개 카테고리 | ~18개 (추정) | 상세 미공개 |
| **합계** | **38개** | 15개 카테고리 |

### 특이사항

- **로컬 설치 방식**: 시밀러웹/AppsFlyer와 달리 원격 서버가 아닌 npm 패키지를 로컬에 설치하는 방식
- **전용 API 키 강력 권장**: 기존 API 키 재사용 금지, MCP 전용 키 생성 권장 (보안)
- **비PII 데이터만**: 사용자 프로필 데이터는 반환하지 않음
- **내부 사용 사례 공개**: Braze 자체 마케팅팀이 MCP를 사용한 경험을 블로그에 상세 공개
- **커뮤니티 확장 버전 존재**: LobeHub에 92개 도구를 가진 커뮤니티 버전이 있음 (공식 아님)

<br>

---

## 4. 경쟁사 비교 종합

### 도구 수 비교

| 서비스 | 도구 수 | 데이터 영역 | 읽기/쓰기 |
|--------|--------|-----------|----------|
| 시밀러웹 | 23개 | 웹 트래픽 + 검색 + 앱(기본) | 읽기 전용 |
| AppsFlyer | 10개 카테고리 (도구 수 미공개) | 어트리뷰션 + 캠페인 + 오디언스 + 딥링크 + 비용 + 광고수익 | 읽기 중심 (일부 쓰기 제한적) |
| Braze | 38개 | CRM + 캠페인 + 세그먼트 + 이벤트 + 구독 | 읽기 전용 |
| **모바일인덱스** | **27개** | **앱 사용량 + 이탈 + 페르소나 + 경쟁사 + 데모그래픽** | **읽기 전용** |

### 인증 방식 비교

| 서비스 | 인증 방식 | 토큰 관리 |
|--------|----------|----------|
| 시밀러웹 | API 키 (HTTP 헤더) | 기존 API 키 그대로 사용 |
| AppsFlyer | OAuth 로그인 (LLM) / Bearer Token (자동화) | 10시간 자동 만료, Security Center에서 관리 |
| Braze | REST API 키 + Base URL | 전용 키 생성 권장, 권한 스코핑 |
| **모바일인덱스 (베타)** | **Bearer Token (환경변수)** | **수동 발급, 환경변수 관리** |

### 서버 방식 비교

| 서비스 | 서버 방식 | 엔드포인트 |
|--------|----------|----------|
| 시밀러웹 | 원격 서버 (시밀러웹 호스팅) | `https://mcp.similarweb.com` |
| AppsFlyer | 원격 서버 (AppsFlyer 호스팅) | `https://mcp.appsflyer.com/auth/mcp` |
| Braze | 로컬 서버 (사용자 PC에 npm 설치) | 로컬 실행 |
| **모바일인덱스 (베타)** | **원격 서버 (자체 호스팅 예정)** | **`https://mcp.mobileindex.com` (예정)** |

### 과금 비교

| 서비스 | MCP 별도 과금 | 과금 방식 |
|--------|-------------|----------|
| 시밀러웹 | ❌ 없음 | 기존 API 구독에 포함, Data Credits 차감 |
| AppsFlyer | ❌ 없음 | 기존 구독에 포함 |
| Braze | ❌ 없음 | 기존 구독에 포함 |
| **모바일인덱스** | **미정** | **기획 중** |

### AI 플랫폼 지원 비교

| 플랫폼 | 시밀러웹 | AppsFlyer | Braze | 모바일인덱스 (베타) |
|--------|---------|-----------|-------|-----------------|
| Claude | ✅ | ✅ | ✅ | ✅ |
| ChatGPT | - | ✅ (Custom GPT + MCP) | - | ✅ (예정) |
| Cursor | ✅ | ✅ | ✅ | ✅ (예정) |
| VS Code | - | ✅ | ✅ | - |
| Copilot Studio | ✅ | - | - | - |
| Gemini CLI | - | ✅ | - | - |
| Kiro | - | - | - | ✅ |
| Windsurf | - | - | - | ✅ (예정) |
| n8n / Zapier | ✅ | ✅ | - | - |

### 상품 페이지 비교

| 항목 | 시밀러웹 | AppsFlyer | Braze |
|------|---------|-----------|-------|
| 전용 상품 페이지 | ✅ (`/corp/ai/mcp`) | ✅ (`/products/agentic-ai/mcp/`) | ❌ (블로그 + 문서만) |
| 직군별 시나리오 | ✅ (에이전시, AI팀, 리서치, 마케팅) | ✅ (마케터 중심) | ❌ |
| 프롬프트 예시 | ✅ (3개 템플릿) | ✅ (카테고리별 다수) | ❌ (블로그에 내부 사례만) |
| 고객 사례 | ✅ (ShopVision) | ✅ (Buff.game 인용) | ✅ (자사 내부 사례) |
| 워크플로우 템플릿 | ❌ | ✅ (GitHub, n8n 2개) | ❌ |
| 오픈소스 | ❌ | ✅ (GitHub 공개) | ❌ (공식), ✅ (커뮤니티) |
| Custom GPT | ❌ | ✅ | ❌ |

<br>

---

## 5. 모바일인덱스 시사점

### 경쟁사 대비 강점

| 항목 | 설명 |
|------|------|
| 앱 데이터 깊이 | 시밀러웹 앱 도구 3개 vs 모바일인덱스 27개. 사용량, 이탈, 페르소나, 경쟁사 비교 등 심화 데이터 |
| 한국 시장 특화 | 한국 앱 시장 데이터 정밀도에서 시밀러웹 대비 우위 |
| 전사 확장 가능성 | 모바일인덱스 + 트레이딩웍스 + 디파이너리 풀 퍼널 조합은 경쟁사 단독으로 불가능 |

### 경쟁사에서 배울 점

| 항목 | 경쟁사 사례 | 모바일인덱스 적용 |
|------|-----------|----------------|
| 과금 | 3곳 모두 기존 구독에 포함 | MCP 별도 과금보다 기존 구독 가치 강화 방향 권장 |
| OAuth 인증 | AppsFlyer의 OAuth 로그인 방식이 사용자 경험 가장 좋음 | 정식 출시 시 OAuth 도입 검토 |
| Custom GPT | AppsFlyer가 ChatGPT 무료 사용자도 접근 가능한 Custom GPT 제공 | 진입 장벽 낮추는 방법으로 검토 |
| 워크플로우 템플릿 | AppsFlyer가 n8n 워크플로우를 GitHub에 공개 | 자동화 시나리오 템플릿 제공 검토 |
| 내부 사용 사례 | Braze가 자사 마케팅팀 사용 경험을 블로그에 공개 | 베타 테스트 결과를 콘텐츠로 활용 |
| 프롬프트 예시 | 시밀러웹/AppsFlyer 모두 공식 프롬프트 템플릿 제공 | 사용자가 바로 따라할 수 있는 프롬프트 가이드 필수 |
| 피드백 도구 | AppsFlyer가 MCP 내에 피드백 제출 도구 내장 | 베타 피드백 수집에 활용 가능 |

<br>

---

## 참고 출처

- [Similarweb MCP 개발자 문서](https://developers.similarweb.com/docs/similarweb-mcp)
- [Similarweb MCP 상품 페이지](https://similarweb.com/corp/ai/mcp)
- [Similarweb MCP 발표 블로그](https://www.similarweb.com/blog/updates/announcements/mcp-server-launch/)
- [Similarweb Copilot Studio 연동 가이드](https://developers.similarweb.com/docs/copilot-mcp-integration)
- [AppsFlyer MCP 헬프센터](https://support.appsflyer.com/hc/en-us/articles/36349070304785--Beta-AppsFlyer-MCP)
- [AppsFlyer MCP 상품 페이지](https://www.appsflyer.com/products/agentic-ai/mcp/)
- [AppsFlyer MCP 블로그](https://www.appsflyer.com/blog/measurement-analytics/appsflyer-mcp-ai/)
- [AppsFlyer MCP 워크플로우 블로그](https://www.appsflyer.com/blog/measurement-analytics/mcp-ai-workflows/)
- [Braze MCP 사용 가능 API 함수 문서](https://www.braze.com/docs/user_guide/brazeai/mcp_server/available_api_functions/)
- [Braze MCP 소개 블로그](https://www.braze.com/resources/articles/introducing-braze-mcp-server)
- [Braze MCP Claude Desktop 연동](https://www.braze.com/resources/articles/braze-mcp-claude-desktop)
- [Braze MCP 설정 문서](https://www.braze.com/docs/user_guide/brazeai/mcp_server/setup)
