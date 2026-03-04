# 카드 짝 맞추기 게임 구현 계획 (Plan.md)

## 📋 문서 정보

* **작성일:** 2026-01-28
* **상태:** Draft
* **버전:** v1.0
* **기반 문서:** TechSpec.md v1.0, prd.md v1.0
* **작성자:** Claude (Senior Architect)

---

## 📋 구현 계획 개요

전체적으로 **Client-Server 아키텍처** 기반의 카드 짝 맞추기 게임입니다. 8개의 Phase로 나누고, 각 Phase를 기능적 원자 단위로 쪼갠 총 **23개의 티켓**으로 구성했습니다.

모든 티켓은 **INVEST 원칙**을 준수합니다:
- **I**ndependent (독립적)
- **N**egotiable (협상 가능)
- **V**aluable (가치 있음)
- **E**stimable (추정 가능)
- **S**mall (작음)
- **T**estable (테스트 가능)

---

## 🎯 Phase 1: 프로젝트 초기 설정

### 티켓 #1
**제목:** 프론트엔드 React(Vite) 프로젝트 초기화

**상세 요구사항:**
- Vite를 사용하여 React + TypeScript 프로젝트를 생성합니다.
- styled-components 라이브러리를 설치합니다.
- axios를 설치하여 HTTP 통신 준비를 합니다.
- 기본 디렉토리 구조를 설정합니다 (`src/components`, `src/hooks`, `src/types`, `src/api`, `src/contexts`).
- 프로젝트가 정상적으로 빌드되고 `npm run dev`로 실행되는지 확인합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] `npm create vite@latest` 명령으로 프로젝트가 생성되었는가?
- [ ] TypeScript가 활성화되어 있고, `tsconfig.json`이 존재하는가?
- [ ] styled-components, axios가 package.json의 dependencies에 포함되어 있는가?
- [ ] `npm run dev` 실행 시 localhost에서 정상적으로 렌더링되는가?
- [ ] `src/components`, `src/hooks`, `src/types`, `src/api`, `src/contexts` 폴더가 생성되어 있는가?

**Why(소프트웨어 공학적 근거):**
Vite는 빠른 HMR(Hot Module Replacement)과 번들링 속도를 제공하여 개발 생산성을 높입니다. TypeScript는 타입 안정성을 통해 런타임 에러를 사전에 방지하고, 컴포넌트 간 인터페이스를 명확히 합니다.

---

### 티켓 #2
**제목:** 백엔드 Express 서버 초기화

**상세 요구사항:**
- Node.js + Express 프로젝트를 생성합니다 (`npm init -y`).
- TypeScript를 설정하고 `ts-node-dev`를 개발 의존성으로 추가합니다.
- Express, cors, uuid 패키지를 설치합니다.
- `src/server.ts` 파일을 생성하고 기본 서버를 3001번 포트에서 실행합니다.
- Health Check 엔드포인트 (`GET /health`)를 추가하여 서버가 정상 동작하는지 확인합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] `npm run dev` 명령으로 서버가 실행되는가?
- [ ] TypeScript로 작성되어 있으며 `tsconfig.json`이 존재하는가?
- [ ] `GET /health` 요청 시 200 응답과 `{ "status": "ok" }`를 반환하는가?
- [ ] express, cors, uuid가 package.json에 포함되어 있는가?
- [ ] 서버가 3001번 포트에서 정상적으로 리스닝하는가?

**Why(소프트웨어 공학적 근거):**
Express는 가볍고 유연한 프레임워크로, 최소한의 보일러플레이트로 REST API를 빠르게 구축할 수 있습니다. Health Check 엔드포인트는 CI/CD 파이프라인과 모니터링 시스템에서 서버 상태를 확인하는 표준적인 방식입니다.

---

### 티켓 #3
**제목:** 프론트엔드-백엔드 CORS 및 Proxy 연동 설정

**상세 요구사항:**
- 백엔드에서 cors 미들웨어를 설정하여 프론트엔드(localhost:5173)의 요청을 허용합니다.
- 프론트엔드 Vite 설정(`vite.config.ts`)에 proxy 옵션을 추가하여 `/api` 경로를 백엔드(localhost:3001)로 포워딩합니다.
- 프론트엔드에서 axios를 사용해 `/api/health`를 호출하고 응답을 콘솔에 출력하여 연동을 테스트합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] 백엔드에서 cors 미들웨어가 설정되어 있는가?
- [ ] `vite.config.ts`에 `/api`에 대한 proxy 설정이 존재하는가?
- [ ] 프론트엔드에서 `axios.get('/api/health')`를 호출했을 때 200 응답을 받는가?
- [ ] 브라우저 콘솔에 CORS 에러가 발생하지 않는가?

**Why(소프트웨어 공학적 근거):**
CORS는 브라우저 보안 정책으로, 명시적인 허용이 필요합니다. Vite의 proxy 기능은 개발 환경에서 Origin을 통일하여 CORS 문제를 우회하고, 프로덕션 환경에서는 Nginx 등의 리버스 프록시로 대체할 수 있습니다.

---

## 🎯 Phase 2: 백엔드 API 구현

### 티켓 #4
**제목:** Card 타입 정의 및 Fisher-Yates 셔플 로직 구현

**상세 요구사항:**
- `src/types/Card.ts`에 Card 인터페이스를 정의합니다 (id, type, imgUrl).
- `src/utils/shuffle.ts`에 Fisher-Yates 셔플 알고리즘을 구현합니다.
- 8종류의 과일 타입 배열을 정의하고, 각 타입당 2개의 Card 객체를 생성하여 총 16개의 카드 배열을 만드는 `generateCards()` 함수를 작성합니다.
- 유닛 테스트를 작성하여 셔플 함수가 배열 길이를 유지하고 모든 요소를 포함하는지 검증합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] Card 인터페이스가 정의되어 있고, id, type, imgUrl 속성을 포함하는가?
- [ ] Fisher-Yates 알고리즘이 정확히 구현되어 있는가?
- [ ] `generateCards()` 함수가 8종류 x 2장 = 16장의 카드를 반환하는가?
- [ ] 셔플 함수를 여러 번 실행했을 때 매번 다른 순서가 나오는가?
- [ ] 유닛 테스트가 통과하는가?

**Why(소프트웨어 공학적 근거):**
Fisher-Yates 알고리즘은 O(n) 시간 복잡도로 배열을 무작위로 섞는 표준 알고리즘입니다. 타입 정의를 통해 프론트엔드와 백엔드 간 데이터 계약(Contract)을 명확히 하여 인터페이스 불일치로 인한 버그를 방지합니다.

---

### 티켓 #5
**제목:** GET /api/game/start 엔드포인트 구현

**상세 요구사항:**
- `src/routes/game.ts`에 라우터를 생성하고 `/start` 경로를 정의합니다.
- GameController를 작성하여 `generateCards()`와 셔플 로직을 호출합니다.
- UUID v4를 사용하여 gameId를 생성하고, cards 배열과 함께 JSON 응답을 반환합니다.
- 응답 시간이 200ms 이내인지 확인합니다 (Performance logging 추가).

**수용 기준 (Acceptance Criteria):**
- [ ] `GET /api/game/start` 요청 시 200 응답이 반환되는가?
- [ ] 응답 본문에 gameId와 cards 배열이 포함되어 있는가?
- [ ] cards 배열의 길이가 16인가?
- [ ] 각 카드 객체가 id, type, imgUrl을 포함하는가?
- [ ] 응답 시간이 200ms 이내인가?

**Why(소프트웨어 공학적 근거):**
RESTful API 설계에서 자원(Resource)의 생성은 POST를 사용하지만, 여기서는 게임 세션을 '시작'하는 것이므로 GET을 사용해도 무방합니다. gameId는 향후 멀티플레이나 세션 관리 확장 시 중요한 식별자가 됩니다.

---

### 티켓 #6
**제목:** 백엔드 에러 핸들링 미들웨어 구현

**상세 요구사항:**
- Express 전역 에러 핸들러 미들웨어를 `src/middlewares/errorHandler.ts`에 작성합니다.
- 서버 내부 에러 발생 시 500 상태 코드와 `{ "error": "Internal Server Error" }` 메시지를 반환합니다.
- 존재하지 않는 경로에 대한 404 에러 핸들러도 추가합니다.
- 에러 발생 시 콘솔에 상세 스택 트레이스를 출력합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] 의도적으로 에러를 발생시켰을 때 500 응답이 반환되는가?
- [ ] 잘못된 경로로 요청했을 때 404 응답이 반환되는가?
- [ ] 에러 응답 본문에 error 메시지가 포함되어 있는가?
- [ ] 서버 콘솔에 에러 스택이 출력되는가?

**Why(소프트웨어 공학적 근거):**
중앙화된 에러 핸들링은 코드 중복을 줄이고, 일관된 에러 응답 형식을 보장합니다. 에러 로깅은 디버깅과 모니터링의 기초이며, 프로덕션 환경에서는 Sentry, DataDog 등의 도구와 통합할 수 있습니다.

---

## 🎯 Phase 3: 프론트엔드 UI 레이아웃

### 티켓 #7
**제목:** 전역 타입 정의 및 기본 테마 설정

**상세 요구사항:**
- `src/types/Card.ts`에 프론트엔드용 Card 인터페이스를 정의합니다 (id, type, imgUrl, isFlipped, isSolved).
- `src/types/GameState.ts`에 GameState 인터페이스를 정의합니다 (cards, flippedCards, life, status).
- `src/styles/theme.ts`에 색상, 폰트, 간격 등의 디자인 토큰을 정의합니다.
- `src/styles/GlobalStyle.ts`에 전역 스타일(reset, font-family 등)을 작성합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] Card와 GameState 인터페이스가 정의되어 있는가?
- [ ] GameState의 status 타입이 'IDLE' | 'PLAYING' | 'GAME_OVER' | 'VICTORY'인가?
- [ ] theme.ts에 색상(primary, background, cardBack 등)과 간격 정의가 있는가?
- [ ] GlobalStyle이 App.tsx에 적용되어 있는가?

**Why(소프트웨어 공학적 근거):**
타입 시스템은 컴파일 타임에 오류를 잡아내어 버그를 줄입니다. 디자인 토큰은 일관된 디자인 시스템을 구축하고, 테마 변경(다크 모드 등)을 용이하게 합니다.

---

### 티켓 #8
**제목:** App 컴포넌트 및 전역 레이아웃 구현

**상세 요구사항:**
- `src/App.tsx`에 전체 레이아웃을 구성합니다.
- 화면 중앙에 600x600px 크기의 게임 컨테이너를 배치합니다.
- 배경색을 #f0f2f5로 설정합니다.
- GlobalStyle과 ThemeProvider를 적용합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] App 컴포넌트가 렌더링되는가?
- [ ] 게임 컨테이너가 화면 중앙에 위치하는가?
- [ ] 컨테이너 크기가 600x600px인가?
- [ ] 배경색이 #f0f2f5인가?

**Why(소프트웨어 공학적 근거):**
레이아웃 컴포넌트를 분리하면 관심사의 분리(Separation of Concerns) 원칙에 따라 UI 구조와 비즈니스 로직을 명확히 구분할 수 있습니다.

---

### 티켓 #9
**제목:** Header 컴포넌트 및 Life 표시 UI 구현

**상세 요구사항:**
- `src/components/Header.tsx` 컴포넌트를 생성합니다.
- Props로 `life` 값을 받아 "남은 기회: {life}/3" 형식으로 표시합니다.
- 게임 보드 상단에 고정 배치하고, 중앙 정렬합니다.
- 폰트 크기 18px, 굵게(Bold) 처리합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] Header 컴포넌트가 생성되었는가?
- [ ] life prop을 받아 화면에 표시하는가?
- [ ] "남은 기회: 3/3" 형식으로 출력되는가?
- [ ] 스타일이 중앙 정렬되고 폰트가 굵은가?

**Why(소프트웨어 공학적 근거):**
컴포넌트는 재사용 가능한 독립적인 UI 단위입니다. Props를 통한 데이터 전달은 단방향 데이터 흐름(Unidirectional Data Flow)을 구현하여 상태 관리를 예측 가능하게 만듭니다.

---

### 티켓 #10
**제목:** GameBoard 컴포넌트 및 4x4 Grid 레이아웃 구현

**상세 요구사항:**
- `src/components/GameBoard.tsx` 컴포넌트를 생성합니다.
- CSS Grid를 사용하여 4x4 레이아웃을 구현합니다 (`grid-template-columns: repeat(4, 1fr)`).
- 카드 간 간격을 10px로 설정합니다 (gap: 10px).
- Props로 cards 배열을 받아 map으로 렌더링합니다 (임시로 카드 ID만 표시).

**수용 기준 (Acceptance Criteria):**
- [ ] GameBoard 컴포넌트가 생성되었는가?
- [ ] display: grid가 적용되어 있는가?
- [ ] 4열로 카드가 정렬되는가?
- [ ] 카드 간 간격이 10px인가?
- [ ] cards prop을 받아 16개의 요소를 렌더링하는가?

**Why(소프트웨어 공학적 근거):**
CSS Grid는 2차원 레이아웃에 최적화되어 있으며, Flexbox보다 간결한 코드로 정렬을 구현할 수 있습니다. 반응형 디자인에도 유리합니다.

---

### 티켓 #11
**제목:** Card 컴포넌트 기본 구조 및 스타일링

**상세 요구사항:**
- `src/components/Card.tsx` 컴포넌트를 생성합니다.
- Props로 cardData (Card), onClick 핸들러를 받습니다.
- 카드 크기를 140x140px로 설정합니다.
- 뒷면은 #2c3e50 색상의 단색으로 표시합니다.
- border-radius를 8px로 설정하여 둥근 모서리를 만듭니다.
- 카드를 클릭하면 onClick 핸들러가 호출되는지 확인합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] Card 컴포넌트가 생성되었는가?
- [ ] 카드 크기가 140x140px인가?
- [ ] 뒷면 배경색이 #2c3e50인가?
- [ ] border-radius가 8px인가?
- [ ] 클릭 시 onClick이 호출되는가?

**Why(소프트웨어 공학적 근거):**
컴포넌트의 단일 책임 원칙(Single Responsibility Principle)을 지키기 위해 카드는 표시와 이벤트 전달만 담당하고, 상태 관리는 부모 컴포넌트에서 처리합니다.

---

## 🎯 Phase 4: 상태 관리

### 티켓 #12
**제목:** GameContext 및 useReducer 설정

**상세 요구사항:**
- `src/contexts/GameContext.tsx`에 Context를 생성합니다.
- useReducer를 사용하여 GameState를 관리합니다.
- Reducer에서 처리할 액션 타입을 정의합니다: INIT_GAME, FLIP_CARD, MATCH_SUCCESS, MATCH_FAIL, GAME_OVER, VICTORY, RESET_GAME.
- GameProvider 컴포넌트를 생성하여 전역 상태를 제공합니다.
- 커스텀 훅 `useGameContext()`를 작성하여 Context를 쉽게 사용할 수 있도록 합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] GameContext가 생성되었는가?
- [ ] useReducer가 설정되어 있는가?
- [ ] 7개의 액션 타입이 정의되어 있는가?
- [ ] GameProvider가 children을 래핑하는가?
- [ ] useGameContext 훅이 동작하는가?

**Why(소프트웨어 공학적 근거):**
Context API + useReducer는 Redux 없이도 전역 상태 관리를 구현할 수 있습니다. Reducer 패턴은 상태 변경 로직을 중앙화하여 예측 가능성과 테스트 용이성을 높입니다.

---

### 티켓 #13
**제목:** Reducer 로직 구현 (액션별 상태 업데이트)

**상세 요구사항:**
- `gameReducer` 함수에서 각 액션에 대한 상태 업데이트 로직을 작성합니다.
- INIT_GAME: cards 배열을 초기화하고, life를 3으로 설정하며, status를 'PLAYING'으로 변경합니다.
- FLIP_CARD: 해당 카드의 isFlipped를 true로 변경하고, flippedCards 배열에 추가합니다.
- MATCH_SUCCESS: 두 카드의 isSolved를 true로 변경하고, flippedCards를 비웁니다.
- MATCH_FAIL: 두 카드의 isFlipped를 false로 변경하고, life를 1 차감합니다.
- GAME_OVER: status를 'GAME_OVER'로 변경합니다.
- VICTORY: status를 'VICTORY'로 변경합니다.
- RESET_GAME: 초기 상태로 되돌립니다.

**수용 기준 (Acceptance Criteria):**
- [ ] 각 액션이 올바른 상태 업데이트를 수행하는가?
- [ ] INIT_GAME 실행 시 life가 3, status가 'PLAYING'인가?
- [ ] FLIP_CARD 실행 시 해당 카드가 flippedCards에 추가되는가?
- [ ] MATCH_FAIL 실행 시 life가 1 감소하는가?
- [ ] 불변성(Immutability)이 유지되는가 (spread 연산자 사용)?

**Why(소프트웨어 공학적 근거):**
불변성은 React의 변경 감지 메커니즘을 효율적으로 작동시키고, 시간 여행 디버깅(Time-travel Debugging)과 같은 고급 기능을 가능하게 합니다.

---

## 🎯 Phase 5: 핵심 게임 로직

### 티켓 #14
**제목:** 게임 초기화 및 /api/game/start API 호출 로직

**상세 요구사항:**
- `src/hooks/useGameInitializer.ts` 커스텀 훅을 작성합니다.
- useEffect를 사용하여 컴포넌트 마운트 시 `/api/game/start`를 호출합니다.
- API 응답을 받아 INIT_GAME 액션을 디스패치합니다.
- 로딩 상태(isLoading)와 에러 상태(error)를 관리합니다.
- API 호출 실패 시 alert로 "서버 연결에 실패했습니다" 메시지를 표시합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] useGameInitializer 훅이 생성되었는가?
- [ ] 컴포넌트 마운트 시 API가 호출되는가?
- [ ] 응답 데이터가 Context에 저장되는가?
- [ ] 로딩 중일 때 로딩 표시가 나타나는가?
- [ ] API 실패 시 에러 메시지가 표시되는가?

**Why(소프트웨어 공학적 근거):**
커스텀 훅은 비즈니스 로직을 재사용 가능한 단위로 분리하여 테스트와 유지보수를 용이하게 합니다. 에러 핸들링은 사용자 경험(UX)의 핵심입니다.

---

### 티켓 #15
**제목:** 카드 클릭 핸들러 및 Flip 상태 관리

**상세 요구사항:**
- `handleCardClick` 함수를 작성합니다.
- 클릭된 카드가 이미 Solved이거나 Flipped 상태이면 클릭을 무시합니다.
- flippedCards의 길이가 2 이상이면 클릭을 무시합니다.
- FLIP_CARD 액션을 디스패치하여 카드를 뒤집습니다.
- 카드를 클릭했을 때 isFlipped 상태가 즉시 업데이트되는지 확인합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] handleCardClick 함수가 작성되었는가?
- [ ] Solved 카드를 클릭해도 상태가 변하지 않는가?
- [ ] 이미 Flipped 카드를 클릭해도 중복으로 추가되지 않는가?
- [ ] flippedCards가 2개일 때 다른 카드 클릭이 무시되는가?
- [ ] 카드를 클릭하면 앞면이 보이는가?

**Why(소프트웨어 공학적 근거):**
엣지 케이스 처리는 소프트웨어 품질의 핵심입니다. Guard Clause 패턴을 사용하여 조건을 명확히 하고 중첩을 줄입니다.

---

### 티켓 #16
**제목:** 카드 매칭 판별 로직 (useEffect)

**상세 요구사항:**
- useEffect를 사용하여 flippedCards의 길이가 2가 될 때 매칭 로직을 실행합니다.
- 두 카드의 type이 같으면 MATCH_SUCCESS 액션을 디스패치합니다.
- 두 카드의 type이 다르면 1초 후 MATCH_FAIL 액션을 디스패치합니다 (setTimeout 사용).
- 매칭 판별 중에는 다른 카드 클릭이 불가능하도록 isMatching 플래그를 설정합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] flippedCards.length === 2일 때 useEffect가 실행되는가?
- [ ] 두 카드가 일치하면 앞면 상태로 고정되는가?
- [ ] 두 카드가 불일치하면 1초 후 뒷면으로 돌아가는가?
- [ ] 매칭 판별 중에는 다른 카드 클릭이 차단되는가?

**Why(소프트웨어 공학적 근거):**
useEffect의 의존성 배열을 통해 특정 상태 변경에만 반응하도록 하여 불필요한 렌더링을 방지합니다. setTimeout은 사용자가 불일치한 카드를 인지할 시간을 제공합니다.

---

### 티켓 #17
**제목:** Life 차감 로직 및 게임 오버 판정

**상세 요구사항:**
- MATCH_FAIL 액션에서 life를 1 차감합니다.
- life가 0이 되면 GAME_OVER 액션을 디스패치합니다.
- status가 'GAME_OVER'가 되면 모든 카드의 클릭 이벤트를 차단합니다.
- Header에서 life 값이 실시간으로 업데이트되는지 확인합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] 매칭 실패 시 life가 1 감소하는가?
- [ ] life가 0이 되면 status가 'GAME_OVER'로 변경되는가?
- [ ] 게임 오버 상태에서 카드 클릭이 차단되는가?
- [ ] Header에 life가 정확히 표시되는가?

**Why(소프트웨어 공학적 근거):**
게임 규칙을 명확히 구현하고, 상태 기반으로 UI를 제어하여 일관성을 유지합니다.

---

### 티켓 #18
**제목:** 승리 조건 판정 로직

**상세 요구사항:**
- useEffect를 사용하여 모든 카드의 isSolved가 true인지 확인합니다.
- 모든 카드가 Solved 상태이면 VICTORY 액션을 디스패치합니다.
- status가 'VICTORY'로 변경되는지 확인합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] 모든 카드가 매칭되면 useEffect가 실행되는가?
- [ ] status가 'VICTORY'로 변경되는가?
- [ ] 승리 조건 판정이 정확한가?

**Why(소프트웨어 공학적 근거):**
승리 조건을 별도의 useEffect로 분리하여 관심사를 명확히 합니다.

---

## 🎯 Phase 6: 인터랙션 및 애니메이션

### 티켓 #19
**제목:** 카드 3D Flip 애니메이션 구현

**상세 요구사항:**
- CSS transform: rotateY(180deg)를 사용하여 카드 뒤집기 애니메이션을 구현합니다.
- transition duration을 0.5s로 설정합니다.
- perspective와 transform-style: preserve-3d를 적용하여 3D 효과를 만듭니다.
- backface-visibility: hidden을 사용하여 카드 뒷면이 투과되지 않도록 합니다.
- 카드가 부드럽게 회전하는지 확인합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] 카드를 클릭하면 뒤집기 애니메이션이 실행되는가?
- [ ] 애니메이션 duration이 0.5s인가?
- [ ] 3D 효과가 적용되어 있는가?
- [ ] 카드 뒷면이 투과되지 않는가?

**Why(소프트웨어 공학적 근거):**
CSS 애니메이션은 JavaScript보다 성능이 뛰어나며, GPU 가속을 활용할 수 있습니다. transform과 opacity는 reflow를 발생시키지 않아 렌더링 성능에 유리합니다.

---

### 티켓 #20
**제목:** 광클 방지 로직 (pointer-events 차단)

**상세 요구사항:**
- 매칭 판별 중(isMatching = true)일 때 GameBoard에 pointer-events: none을 적용합니다.
- 또는 handleCardClick에서 isMatching 플래그를 체크하여 클릭을 무시합니다.
- 빠르게 여러 카드를 클릭해도 로직이 깨지지 않는지 테스트합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] 매칭 판별 중에는 다른 카드 클릭이 차단되는가?
- [ ] pointer-events: none이 적용되는가?
- [ ] 빠른 연속 클릭 시 오작동이 발생하지 않는가?

**Why(소프트웨어 공학적 근거):**
Debounce와 Throttle은 과도한 이벤트 호출을 방지하여 성능과 안정성을 높입니다.

---

### 티켓 #21
**제목:** 이미지 Preload 로직 구현

**상세 요구사항:**
- 게임 시작 전 8개의 과일 이미지를 미리 로드하는 함수를 작성합니다.
- Promise.all과 Image 객체를 사용하여 모든 이미지 로딩을 확인합니다.
- 로딩이 완료되면 게임 화면을 표시합니다.
- 로딩 중에는 "Loading..." 메시지를 표시합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] 이미지 preload 함수가 작성되었는가?
- [ ] 모든 이미지가 로드된 후 게임이 시작되는가?
- [ ] 로딩 중에는 "Loading..." 메시지가 표시되는가?
- [ ] 카드를 뒤집을 때 이미지가 깜빡이지 않는가?

**Why(소프트웨어 공학적 근거):**
이미지 preload는 사용자 경험(UX)을 크게 개선합니다. 네트워크 지연으로 인한 깜빡임을 방지합니다.

---

## 🎯 Phase 7: 모달 및 결과 화면

### 티켓 #22
**제목:** ResultModal 컴포넌트 및 재시작 버튼 구현

**상세 요구사항:**
- `src/components/ResultModal.tsx` 컴포넌트를 생성합니다.
- Props로 isOpen, result ('GAME_OVER' | 'VICTORY'), onRestart를 받습니다.
- 화면 중앙에 모달을 배치하고, 배경을 반투명 검은색(rgba(0,0,0,0.7))으로 설정합니다.
- result에 따라 다른 메시지를 표시합니다:
  - GAME_OVER: "아쉽네요. 다시 도전해보세요!"
  - VICTORY: "축하합니다! 모든 짝을 찾았습니다!"
- "게임 재시작" 버튼을 추가하고, 클릭 시 onRestart 핸들러를 호출합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] ResultModal 컴포넌트가 생성되었는가?
- [ ] 모달이 화면 중앙에 배치되는가?
- [ ] 배경이 반투명한가?
- [ ] result에 따라 다른 메시지가 표시되는가?
- [ ] "게임 재시작" 버튼을 클릭하면 onRestart가 호출되는가?

**Why(소프트웨어 공학적 근거):**
모달은 사용자의 주의를 집중시키고, 중요한 메시지를 전달하는 데 효과적입니다. Portal API를 사용하면 모달을 DOM 트리의 최상위에 렌더링하여 z-index 충돌을 방지할 수 있습니다.

---

### 티켓 #23
**제목:** 게임 재시작 로직 구현

**상세 요구사항:**
- handleRestart 함수를 작성합니다.
- /api/game/start를 다시 호출하여 새로운 카드 배열을 받습니다.
- RESET_GAME 액션을 디스패치하여 상태를 초기화합니다.
- 모달을 닫고 게임을 다시 시작합니다.

**수용 기준 (Acceptance Criteria):**
- [ ] handleRestart 함수가 작성되었는가?
- [ ] "게임 재시작" 버튼 클릭 시 API가 호출되는가?
- [ ] 상태가 초기화되는가 (life=3, status='PLAYING')?
- [ ] 카드가 새롭게 셔플되어 배치되는가?
- [ ] 모달이 닫히는가?

**Why(소프트웨어 공학적 근거):**
재시작 로직은 사용자가 게임을 반복적으로 즐길 수 있도록 하여 재미(Retention)를 높입니다.

---

## 📊 구현 계획 요약

| Phase | 티켓 번호 | 티켓 수 | 주요 내용 |
|-------|----------|---------|----------|
| **Phase 1** | #1-3 | 3개 | 프로젝트 초기 설정 (React, Express, CORS) |
| **Phase 2** | #4-6 | 3개 | 백엔드 API 구현 (셔플, /start, 에러 핸들링) |
| **Phase 3** | #7-11 | 5개 | 프론트엔드 UI 레이아웃 (타입, 레이아웃, 컴포넌트) |
| **Phase 4** | #12-13 | 2개 | 상태 관리 (Context, Reducer) |
| **Phase 5** | #14-18 | 5개 | 핵심 게임 로직 (초기화, 클릭, 매칭, 판정) |
| **Phase 6** | #19-21 | 3개 | 인터랙션 및 애니메이션 (Flip, 광클 방지, Preload) |
| **Phase 7** | #22-23 | 2개 | 모달 및 재시작 기능 |
| **합계** | #1-23 | **23개** | 전체 구현 |

---

## ✅ INVEST 원칙 검증

모든 티켓이 INVEST 원칙을 준수하는지 확인했습니다:

- **Independent (독립적):** 대부분의 티켓은 독립적으로 작업 가능하며, 의존성이 있는 경우 Phase로 명확히 구분했습니다.
- **Negotiable (협상 가능):** 각 티켓의 세부 구현 방식은 개발 중 조정 가능합니다.
- **Valuable (가치 있음):** 각 티켓은 사용자나 시스템에 명확한 가치를 제공합니다.
- **Estimable (추정 가능):** 각 티켓은 명확한 범위를 가지며, 개발 시간을 추정할 수 있습니다.
- **Small (작음):** 각 티켓은 한 번의 작업 세션에서 완료 가능한 크기입니다.
- **Testable (테스트 가능):** 모든 티켓에 수용 기준(AC)이 명시되어 테스트 가능합니다.

---

## 🎓 소프트웨어 공학 관점의 설계 원칙

### 1. Agile 방법론
- **점진적 개발 (Incremental Development):** 각 Phase를 완료할 때마다 동작하는 소프트웨어를 확보
- **반복적 개선 (Iterative Improvement):** 조기에 피드백을 받고 리스크를 관리
- **작은 배치 크기 (Small Batch Size):** 각 티켓은 독립적으로 배포 가능한 작은 단위

### 2. Clean Code 원칙
- **단일 책임 원칙 (SRP):** 각 컴포넌트와 함수는 하나의 책임만 가짐
- **관심사의 분리 (Separation of Concerns):** UI, 상태 관리, 비즈니스 로직을 명확히 구분
- **불변성 (Immutability):** React의 상태 변경 감지를 효율적으로 작동

### 3. 디자인 패턴
- **Reducer 패턴:** 상태 변경 로직을 중앙화하여 예측 가능성 향상
- **Context API 패턴:** 전역 상태 관리를 간결하게 구현
- **Custom Hook 패턴:** 비즈니스 로직을 재사용 가능한 단위로 분리

### 4. 성능 최적화
- **CSS 애니메이션:** JavaScript보다 성능이 뛰어나며 GPU 가속 활용
- **이미지 Preload:** 네트워크 지연으로 인한 깜빡임 방지
- **Debounce/Throttle:** 과도한 이벤트 호출 방지

### 5. 사용자 경험 (UX)
- **에러 핸들링:** 서버 연결 실패 시 명확한 메시지 제공
- **로딩 상태:** 이미지 로딩 중 "Loading..." 메시지 표시
- **피드백:** 매칭 성공/실패 시 즉각적인 시각적 피드백

---

## 🚀 다음 단계

### Phase 8 (선택 사항): CI/CD 및 자동화
- GitHub Actions를 활용한 자동화된 테스트 파이프라인 구축
- Vercel 또는 Netlify를 통한 자동 배포
- ESLint, Prettier를 통한 코드 품질 관리
- Jest, React Testing Library를 통한 유닛 테스트 작성

### 문서화
- README.md 작성 (프로젝트 소개, 설치 방법, 실행 방법)
- CLAUDE.md 업데이트 (프로젝트별 컨텍스트 추가)
- 아키텍처 다이어그램 추가 (Mermaid 차트 활용)

---

## 📝 GitHub 이슈 생성 가이드

각 티켓을 GitHub 이슈로 생성할 때 다음 템플릿을 사용하세요:

```markdown
## 제목
[Phase N] 티켓 #X - [티켓 제목]

## 설명
[상세 요구사항]

## 수용 기준 (Acceptance Criteria)
- [ ] AC 1
- [ ] AC 2
- [ ] AC 3
...

## 레이블
- `phase-N`
- `frontend` 또는 `backend`
- `priority-high` 또는 `priority-medium` 또는 `priority-low`

## 마일스톤
Phase N: [Phase 이름]
```

---

**작성 완료일:** 2026-01-28
**문서 상태:** Draft → Ready for Review → Approved
