# 모바일인덱스 MCP — DB 직접 연동 개발안

> Small DMP DB에 AI를 직접 연결하여, 사용자가 자연어로 질문하면 Agent가 SQL을 생성·실행하여 답변

---

## 요약

금일 개발팀과 논의한 내용을 바탕으로 추가 조사한 결론입니다.

- **MCP 서버 하나에 API + DB 연결을 모두 포함**할 수 있음
  - 기존 API 도구 27개 + DB 도구 2~3개를 하나의 MCP 서버에서 제공
  - AI가 질문에 따라 API 도구 / DB 도구를 자동 선택
  - 동일 데이터가 양쪽에 있을 경우, **도구 설명에 우선순위를 명시**하여 제어 (별도 분기 로직 불필요)
- **DB에 가중치까지 포함된 테이블**을 만들어서 연동해야 함
  - RAW 데이터가 아니라, 성/연령 가중치가 적용된 최종 수치가 들어간 테이블
  - AI는 단순 SELECT만 하면 되므로 SQL 정확도가 높음
- **데이터 스키마가 있다면 별도 RAG 불필요**, 간단한 형태로 개발 가능
  - 테이블 스키마(테이블명, 컬럼명, 타입, 설명)를 MCP 도구 설명에 포함하면 AI가 SQL을 생성할 수 있음
  - 벡터 DB, 별도 AI 모델, 새 서버 전부 불필요
- **현재 프로토타입은 API 기반으로 개발 완료** 상태이므로, DB 연동분은 추가 개발하여 얹으면 됨

---

## 1. 개요

### 목표

모바일인덱스에서 볼 수 없는 데이터(교차 사용자, 커스텀 세그먼트 등)를 Small DMP DB에 구축하고, 기존 MCP 서버에 DB 도구를 추가하여 AI가 직접 DB를 조회할 수 있도록 합니다.

### 동작 흐름

```
사용자: "카카오톡 20대 여성 사용자 수 추이 보여줘"
    ↓
AI Agent (Kiro / Claude)
    ↓ 자연어 → SQL 변환
MCP 도구: query_database
    ↓ SQL 실행
Small DMP DB (Snowflake)
    ↓ 결과 반환
AI Agent → 사용자에게 분석 결과 답변
```

### MCP 서버 구조 — API + DB를 하나로

기존 API 기반 MCP 서버에 DB 도구를 추가합니다. 별도 서버가 아니라 하나의 MCP 서버에서 모두 제공합니다.

```
모바일인덱스 MCP 서버 (하나)
├── API 도구 27개 (기존 — Insight API 호출)
│   ├── search_app
│   ├── chart_top_usage
│   ├── app_summary
│   └── ...
│
└── DB 도구 2~3개 (추가 — Small DMP 직접 쿼리)
    ├── get_db_schema
    ├── query_database
    └── get_sample_data
```

AI가 질문에 따라 적절한 도구를 자동으로 선택합니다.

| 질문 | AI가 선택하는 도구 |
|------|-------------------|
| "카카오톡 MAU 알려줘" | API 도구 (`app_summary`) |
| "증권 업종 TOP 20" | API 도구 (`usage_rank`) |
| "카카오톡과 네이버 교차 사용자 수" | DB 도구 (`query_database`) |
| "배민 20대 여성 사용 시간 추이" | DB 도구 (`query_database`) |

### API와 DB에 겹치는 데이터가 있을 때

교차 사용자 분석처럼 API와 DB 모두에서 가능한 데이터가 있습니다. 별도 폴백 로직이나 분기 코드는 필요 없고, **도구 설명에서 우선순위를 명시**하면 됩니다.

```
// API 도구 — 우선 사용
usage_overlap_rank: "특정 앱 사용자가 동시에 사용하는 다른 앱 순위를 분석합니다.
                    모바일인덱스 공식 데이터 기준. 기본적으로 이 도구를 먼저 사용하세요."

// DB 도구 — API로 안 될 때
query_database: "Small DMP DB에 SQL을 실행합니다.
                API 도구로 제공되지 않는 조건의 분석이 필요하거나,
                3개 이상 앱의 교차 분석, 커스텀 조건 조합 등이 필요할 때 사용하세요."
```

AI는 도구 설명을 충실하게 따르기 때문에, "기본적으로 API 먼저"라고 써두면 API를 우선 사용하고, API로 안 되는 조건일 때만 DB를 씁니다. 도구 설명이 곧 라우팅 규칙 역할을 합니다.

### API 기반 MCP와의 비교

| 항목 | API 기반 MCP (Phase 1) | DB 연동 MCP (Phase 2) |
|------|----------------------|---------------------|
| 데이터 소스 | Insight API 호출 | Small DMP DB 직접 쿼리 |
| AI가 하는 일 | 도구 선택 + 파라미터 입력 | SQL 생성 + 실행 |
| 데이터 범위 | 모바일인덱스 대시보드와 동일 | **대시보드에 없는 데이터** |
| 가이드 역할 | API 문서 (도구 설명) | DB 스키마 (테이블/컬럼 설명) |
| RAG 필요 여부 | ❌ 불필요 | ❌ 불필요 (스키마가 가이드 역할) |
| 유연성 | API에 정의된 조회만 가능 | **자유로운 쿼리 가능** |

### 자체 AI 대비 MCP의 구조적 차이

디파이너리 클레어/이안처럼 자체 AI를 만들면, 의도 분류 → 도구 선택 → 파라미터 추출 → API 호출 → 결과 해석 → 답변 생성까지 중간 에이전트(오케스트레이션)를 전부 직접 개발해야 합니다.

MCP는 이 중간 과정을 **AI 플랫폼(Claude, Kiro 등)이 전부 처리**합니다.

```
자체 AI (클레어/이안 방식)
  사용자 질문
    → 의도 분류 에이전트 (직접 개발)
    → 도구 선택 에이전트 (직접 개발)
    → 파라미터 추출 에이전트 (직접 개발)
    → API 호출
    → 결과 해석 에이전트 (직접 개발)
    → 답변 생성
  = 중간 분기점(오케스트레이션)을 전부 직접 개발

MCP 방식
  사용자 질문
    → Claude/Kiro가 알아서:
      의도 파악 → 도구 선택 → 파라미터/SQL 생성 → 도구 호출 → 결과 해석 → 답변 생성
  = 우리가 만드는 건 도구(데이터 연결)만
```

MCP 도구 개발이 1~2일이면 되는 이유가 이것입니다. 오케스트레이션 로직, 의도 분류, 분기 처리를 만들 필요가 없고, Anthropic/OpenAI가 만든 AI 인프라를 그대로 사용합니다.

---

## 2. 개발 필요 사항

현재 API 기반 MCP 프로토타입은 개발 완료 상태입니다. DB 연동을 위해 **추가로 필요한 것**만 정리합니다.

### ✅ 필요

| 항목 | 설명 | 담당 |
|------|------|------|
| **Small DMP DB** | 전사 앱 데이터에서 표본 추출 + 가중치 적용된 경량 DB (Snowflake) | DMP 팀 |
| **DB 접속 정보** | 호스트, 포트, DB명, 읽기 전용 계정 | DMP 팀 + 백엔드 |
| **테이블 스키마 문서** | 테이블명, 컬럼명, 타입, 설명. AI가 SQL을 짜려면 필수 | DMP 팀 + 기획 |
| **MCP 도구 추가 개발** | 기존 MCP 서버에 DB 쿼리 도구 2~3개 추가 | 기획 |
| **읽기 전용 계정** | SELECT만 가능한 DB 계정. 데이터 변경 방지 | 백엔드 |

### ❌ 불필요

| 항목 | 이유 |
|------|------|
| **RAG / 벡터 DB** | 테이블 스키마를 도구 설명에 넣으면 AI가 SQL을 생성할 수 있음 |
| **별도 AI 모델** | Claude/Kiro 등 기존 AI가 SQL 생성을 잘 함. 파인튜닝 불필요 |
| **새로운 서버** | 기존 MCP 서버에 도구만 추가하면 됨 |
| **프론트엔드** | 기존 AI 플랫폼 UI를 그대로 사용 |
| **Text-to-SQL 전용 엔진** | LLM이 이미 SQL을 잘 생성함 |

---

## 3. Small DMP 추출 기준

### 논의 결과

| 항목 | 기준 |
|------|------|
| 대상 ADID | `untracked_date = NULL` (활성 사용자만, 트래킹 해제 데이터 제외) |
| 데이터 기간 | 최근 3개월 |
| 표본 크기 | 전체의 **절반** (랜덤 추출) |
| 가중치 | MI 동일 가중치 사용, 표본이 절반이므로 **성/연령대별 가중치 2배** 적용 |
| DB 환경 | Snowflake |
| 원본 테이블 | adid_info + app_tracking_v2 → 필요 컬럼만 합친 형태 |

### 원본 테이블 (DMP 팀 제공)

**adid_info**

| 컬럼 | 설명 |
|------|------|
| adid | 광고 식별자 |
| age | 연령대 |
| gender | 성별 |
| p_age | 추정 연령 |
| p_gender | 추정 성별 |
| p_marry | 추정 결혼 여부 |
| carrier | 통신사 |
| device_model | 기기 모델 |
| device_os | OS |
| regist_date | 등록일 |
| update_date | 업데이트일 |
| untracked_date | 추적 해제일 |
| active_true_cnt | 활성 횟수 |
| agree_stat | 동의 상태 |
| disagree_date | 동의 해제일 |

**app_tracking_v2**

| 컬럼 | 설명 |
|------|------|
| adid | 광고 식별자 |
| carrier | 통신사 |
| device_model | 기기 모델 |
| device_os | OS |
| gender | 성별 |
| age | 연령대 |
| package_name | 앱 패키지명 |
| install_market | 설치 마켓 |
| first_install_date | 최초 설치일 |
| last_update_date | 마지막 업데이트일 |
| last_use_date | 마지막 사용일 |
| daily_use_sec | 일간 사용 시간 |
| week_use_sec | 주간 사용 시간 |
| search_key | 사용 일자 |

### Small DMP 테이블 (위 두 테이블에서 필요분만 합친 형태)

위 두 테이블을 JOIN하여, MCP에 필요한 컬럼만 추출 + 성/연령 가중치를 적용한 경량 테이블을 만듭니다.

**테이블 구조 (일간/주간/월간 동일)**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| adid | VARCHAR | 광고 식별자 (ADID) |
| gender | ENUM(m, f) | 성별 |
| age | ENUM(10, 20, 30, 40, 50, 60) | 연령대 |
| package_name | VARCHAR | 앱 패키지명 |
| daily_use_cnt | FLOAT | 사용 횟수 × 성/연령 가중치 (2배) |
| daily_use_sec | FLOAT | 사용 시간 × 성/연령 가중치 (2배) |
| search_key | DATE | 사용 일자 (주간은 월요일, 월간은 1일) |

**테이블 3개**

| 테이블 | 기간 | search_key 기준 |
|--------|------|----------------|
| `app_track_daily` | 일간 | 해당 날짜 |
| `app_track_weekly` | 주간 | 해당 주 ADID 중복 제거 후 합산 |
| `app_track_monthly` | 월간 | 해당 월 ADID 중복 제거 후 합산 |

> 일간 → 주간/월간은 단순 SUM이 아니라, 기간 내 ADID 중복 제거 후 가중치 합산

---

## 4. 진행 순서

### 1차 — API 기반 MCP (현재 완료)
- 모바일인덱스 Insight API 27개 도구
- 기획 측 개발 완료, 서버 배포만 남음

### 2차 — Small DMP 기반 MCP (추가 개발)
- API에 없는 새로운 데이터는 Small DMP → MCP로 제공
- 1차와 분리해서 순차적으로 프로토타입 진행, 이후 합침

### 개발 항목

| # | 작업 | 설명 | 담당 | 선행 조건 |
|---|------|------|------|----------|
| 1 | Small DMP 설계 | 어떤 테이블/데이터를 넣을지 정의 | 기획 + DMP | — |
| 2 | Small DMP 구축 | adid_info + app_tracking_v2에서 활성 ADID만 추출, 가중치 적용, 일간/주간/월간 집계 테이블 생성 (Snowflake) | DMP | #1 완료 |
| 3 | 읽기 전용 계정 생성 | SELECT만 가능한 DB 계정 | 백엔드 | #2 완료 |
| 4 | 스키마 문서 작성 | 테이블/컬럼 설명 정리 (AI가 SQL 짜는 데 필요) | 기획 + DMP | #2 완료 |
| 5 | MCP 도구 추가 개발 | 기존 MCP 서버에 get_db_schema + query_database 도구 추가 | 기획 | #3, #4 완료 |
| 6 | 테스트 | 자연어 → SQL → 결과 검증 | 기획 | #5 완료 |
| 7 | 기존 MCP 서버에 통합 배포 | Phase 1 서버에 DB 도구 합쳐서 배포 | 기획 + 백엔드 | #6 완료 |

> 핵심 병목: **Small DMP 구축 (#1, #2)**이 전체 일정을 결정합니다. MCP 도구 개발 자체는 DB만 있으면 1~2일이면 가능합니다.

### 프로토타입 배포 대상
- 아이지에이웍스 내부: 마케팅팀, AM팀 + 알파
- 외부 고객사는 대상 아님

---


## 5. 구현 방법 상세

### 5-1. MCP 도구 설계

기존 MCP 서버에 아래 도구를 추가합니다.

**도구 1: `get_db_schema`**

```
도구명: get_db_schema
설명: "Small DMP DB의 테이블 구조를 조회합니다. SQL을 작성하기 전에 먼저 이 도구로 스키마를 확인하세요."
파라미터: 
  - table_name (선택) — 특정 테이블만 조회. 미입력 시 전체 목록 반환
반환: 테이블명, 컬럼명, 타입, 설명
```

**도구 2: `query_database`**

```
도구명: query_database
설명: "Small DMP DB에 SQL을 실행합니다. SELECT 쿼리만 허용됩니다. get_db_schema로 스키마를 먼저 확인한 후 사용하세요."
파라미터:
  - sql (필수) — 실행할 SELECT 쿼리
  - limit (선택) — 최대 반환 행 수 (기본 100)
반환: 쿼리 결과 (JSON)
```

**도구 3: `get_sample_data` (선택)**

```
도구명: get_sample_data
설명: "특정 테이블의 샘플 데이터 5건을 반환합니다."
파라미터:
  - table_name (필수)
반환: 상위 5행
```

### 5-2. AI가 SQL을 잘 짜게 하려면

RAG 대신, **스키마를 도구 설명에 포함**하면 됩니다.

```
도구: query_database
설명: |
  Small DMP DB에 SQL을 실행합니다.
  
  [테이블 구조]
  app_track_daily / app_track_weekly / app_track_monthly (구조 동일):
    - adid (VARCHAR): 광고 식별자
    - gender (ENUM: m, f): 성별
    - age (ENUM: 10, 20, 30, 40, 50, 60): 연령대
    - package_name (VARCHAR): 앱 패키지명
    - daily_use_cnt (FLOAT): 사용 횟수 (성/연령 가중치 적용됨, 2배)
    - daily_use_sec (FLOAT): 사용 시간 (성/연령 가중치 적용됨, 2배)
    - search_key (DATE): 일간=날짜, 주간=월요일, 월간=1일
  
  [주의]
  - 사용자 수 = COUNT(DISTINCT adid)
  - 교차 사용자 = 같은 search_key에서 ADID JOIN
  - daily_use_cnt, daily_use_sec는 이미 가중치가 적용된 값
```

테이블이 3개뿐이고 구조가 동일하므로, 스키마를 도구 설명에 넣는 것만으로 충분합니다.

### 5-3. 왜 RAG가 필요 없는가

RAG가 필요한 경우는 "AI가 참고해야 할 정보가 너무 많아서, 필요한 것만 검색해서 가져와야 할 때"입니다.

MCP는 도구를 등록할 때 `description`에 필요한 정보를 모두 기재할 수 있습니다. AI는 도구를 호출하기 전에 이 description을 읽고 판단합니다.

```js
// MCP 서버 코드 — 도구 등록 시 description에 스키마/규칙을 모두 포함
server.registerTool("query_database", {
  description: `Small DMP DB에 SQL을 실행합니다.

  [테이블 구조]
  app_track_daily / app_track_weekly / app_track_monthly:
    - adid (VARCHAR): 광고 식별자
    - gender (ENUM: m, f): 성별
    - age (ENUM: 10, 20, 30, 40, 50, 60): 연령대
    - package_name (VARCHAR): 앱 패키지명
    - daily_use_cnt (FLOAT): 사용 횟수 (가중치 적용됨)
    - daily_use_sec (FLOAT): 사용 시간 (가중치 적용됨)
    - search_key (DATE): 일간=날짜, 주간=월요일, 월간=1일

  [규칙]
  - 사용자 수 = COUNT(DISTINCT adid)
  - API 도구로 가능한 분석은 API를 먼저 사용하세요
  - SELECT만 허용`,
  ...
});
```

Small DMP는 테이블 3개 × 컬럼 7개로 정보량이 적기 때문에, description만으로 충분합니다. 테이블이 100개, 컬럼이 500개 수준이 되면 description에 다 못 넣으므로 그때 RAG가 필요하지만, 이 규모에서는 해당하지 않습니다.

### 5-4. 보안

| 항목 | 대응 |
|------|------|
| SQL Injection | 읽기 전용 계정 사용 (SELECT만 허용). INSERT/UPDATE/DELETE/DROP 등 차단 |
| 데이터 유출 | MCP 서버에서 API 키 인증 (기존과 동일). 인증된 사용자만 접근 |
| 과도한 쿼리 | 결과 행 수 제한 (기본 100행), 쿼리 타임아웃 설정 (10초) |
| 민감 데이터 | Small DMP 구축 시 민감 컬럼 제외 또는 마스킹 |

---

## 6. 예상 질의 예시

| 자연어 질문 | AI가 생성하는 SQL (예시) |
|------------|----------------------|
| "카카오톡 3월 MAU" | `SELECT COUNT(DISTINCT adid) FROM app_track_monthly WHERE package_name='com.kakao.talk' AND search_key='2026-03-01'` |
| "카카오톡 20대 여성 MAU 추이" | `SELECT search_key, COUNT(DISTINCT adid) FROM app_track_monthly WHERE package_name='com.kakao.talk' AND age='20' AND gender='f' GROUP BY search_key ORDER BY search_key` |
| "배민과 쿠팡이츠 동시 사용자 수" | `SELECT COUNT(DISTINCT a.adid) FROM app_track_monthly a JOIN app_track_monthly b ON a.adid=b.adid AND a.search_key=b.search_key WHERE a.package_name='com.baemin' AND b.package_name='com.coupangeats' AND a.search_key='2026-03-01'` |
| "앱 A, B, C 교차 사용자" | 3개 테이블 JOIN으로 ADID 교집합 |
| "증권 업종 30대 남성 DAU TOP 10" | `SELECT package_name, COUNT(DISTINCT adid) as dau FROM app_track_daily WHERE age='30' AND gender='m' AND search_key='2026-04-14' GROUP BY package_name ORDER BY dau DESC LIMIT 10` |
| "카카오톡 사용 시간 추이 (주간)" | `SELECT search_key, SUM(daily_use_sec) FROM app_track_weekly WHERE package_name='com.kakao.talk' GROUP BY search_key ORDER BY search_key` |

---

## 7. 주의 사항

| 항목 | 내용 |
|------|------|
| **Text-to-SQL 난이도** | API 연동과 Text-to-SQL은 차원이 다름. DB 연결 자체는 문제 없지만, AI가 어떻게 답변할지는 프로토타입에서 검증 필요 |
| **할루시네이션** | DB 직접 연결 시 사용자 수 등에서 할루시네이션 발생 가능. 가중치 적용 + 스키마 설명으로 최소화 |
| **사업화** | 판매까지 디벨롭하려면 일이 커짐. 어떻게 엣지를 만들어서 사업화할지는 추가 고민 필요 |

---

## 8. 정리

- 현재 API 기반 MCP 프로토타입은 **개발 완료** 상태. DB 연동분은 **추가 개발하여 얹으면 됨**
- 하나의 MCP 서버에 API 도구 27개 + DB 도구 2~3개를 함께 제공
- DMP 팀에서 adid_info + app_tracking_v2를 합쳐, **활성 ADID 절반 추출 + 가중치 2배 적용 + 최근 3개월** 집계 테이블 생성 (Snowflake)
- ADID 단위 데이터이므로 **교차 사용자 분석, 커스텀 세그먼트** 등 자유로운 분석 가능
- RAG, 벡터 DB, 별도 AI 모델, 새 서버 **전부 불필요**
- 핵심 병목은 **Small DMP 구축 일정** (DMP 팀 협의 필요)
- MCP 도구 개발 자체는 DB만 있으면 **1~2일**
