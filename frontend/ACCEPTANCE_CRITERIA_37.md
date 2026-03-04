# Issue #37: Acceptance Criteria 검증 결과

## ✅ Acceptance Criteria 체크리스트

### AC 1: useGameInitializer 훅이 생성되었는가?

**✅ 통과**

**파일 위치**: `frontend/src/hooks/useGameInitializer.ts`

**훅 구조**:
```typescript
export function useGameInitializer(): void {
  const { state, dispatch } = useGameContext()

  useEffect(() => {
    // 이미 게임이 초기화되었거나 로딩 중이면 API 호출을 건너뜀
    if (state.gameId !== null || state.isLoading) {
      return
    }

    const initializeGame = async () => {
      dispatch({ type: 'SET_LOADING', payload: true })

      try {
        const { gameId, cards } = await startGame()
        dispatch({ type: 'INIT_GAME', payload: { gameId, cards } })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
        dispatch({ type: 'SET_ERROR', payload: errorMessage })
        alert(`게임 초기화 실패\n\n${errorMessage}`)
      }
    }

    initializeGame()
  }, [state.gameId, state.isLoading, dispatch])
}
```

**검증:**
- ✅ useGameInitializer 훅 생성 완료
- ✅ useEffect로 컴포넌트 마운트 시 API 호출
- ✅ 로딩 상태와 에러 상태 관리
- ✅ 중복 호출 방지 (gameId 체크)

---

### AC 2: 컴포넌트 마운트 시 API가 호출되는가?

**✅ 통과**

**useEffect 의존성 배열**:
```typescript
useEffect(() => {
  // 컴포넌트 마운트 시 한 번만 실행
  if (state.gameId !== null || state.isLoading) {
    return
  }

  const initializeGame = async () => {
    // API 호출 로직
  }

  initializeGame()
}, [state.gameId, state.isLoading, dispatch])
```

**API 호출 흐름**:
```
컴포넌트 마운트
  ↓
useEffect 실행
  ↓
gameId === null && !isLoading 확인
  ↓
SET_LOADING(true) 디스패치
  ↓
startGame() API 호출 (/api/game/start)
  ↓
응답 수신
  ↓
INIT_GAME 디스패치
```

**검증:**
- ✅ useEffect 사용
- ✅ 의존성 배열 정확히 설정
- ✅ 중복 호출 방지 로직
- ✅ async/await 패턴 사용

---

### AC 3: 응답 데이터가 Context에 저장되는가?

**✅ 통과**

**INIT_GAME 액션 디스패치**:
```typescript
try {
  // API 호출
  const { gameId, cards } = await startGame()

  // 게임 초기화 액션 디스패치
  dispatch({
    type: 'INIT_GAME',
    payload: { gameId, cards },
  })

  console.log(`[Game Initialized] gameId: ${gameId}, cards: ${cards.length}`)
} catch (error) {
  // 에러 처리
}
```

**백엔드 응답을 프론트엔드 Card 타입으로 변환** (`gameApi.ts`):
```typescript
// 백엔드 응답: { id, type, imgUrl }
// 프론트엔드 Card: { id, type, imgUrl, isFlipped, isSolved }

const cards: Card[] = response.data.cards.map((card) => ({
  ...card,
  isFlipped: false,  // 초기값
  isSolved: false,   // 초기값
}))

return {
  gameId: response.data.gameId,
  cards,
}
```

**Context 상태 업데이트** (GameContext의 INIT_GAME):
```typescript
case 'INIT_GAME':
  return {
    ...state,
    gameId: action.payload.gameId,
    cards: action.payload.cards,
    flippedCards: [],
    life: 3,
    status: 'PLAYING',
    isLoading: false,
    error: null,
  }
```

**검증:**
- ✅ API 응답을 Context에 저장
- ✅ gameId와 cards 배열 모두 저장
- ✅ 백엔드 Card 타입 → 프론트엔드 Card 타입 변환
- ✅ isFlipped, isSolved 필드 추가 (초기값: false)

---

### AC 4: 로딩 중일 때 로딩 표시가 나타나는가?

**✅ 통과**

**로딩 상태 관리**:
```typescript
// 로딩 시작
dispatch({ type: 'SET_LOADING', payload: true })

// API 호출
const { gameId, cards } = await startGame()

// 게임 초기화 (로딩 종료)
dispatch({ type: 'INIT_GAME', payload: { gameId, cards } })
```

**UI에서 로딩 표시** (`App.tsx`):
```typescript
// 로딩 중일 때
if (state.isLoading) {
  return (
    <GameContainer>
      <LoadingContainer>Loading...</LoadingContainer>
    </GameContainer>
  )
}
```

**LoadingContainer 스타일**:
```typescript
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.xl};  // 20px
  color: ${({ theme }) => theme.colors.primary};    // #3498db
  font-weight: ${({ theme }) => theme.fontWeights.bold};  // 700
`
```

**검증:**
- ✅ isLoading 상태 관리
- ✅ 로딩 중일 때 "Loading..." 표시
- ✅ 중앙 정렬 및 스타일링
- ✅ 로딩 완료 후 게임 화면 표시

---

### AC 5: API 실패 시 에러 메시지가 표시되는가?

**✅ 통과**

**에러 핸들링** (`useGameInitializer.ts`):
```typescript
try {
  // API 호출
} catch (error) {
  // 에러 메시지 추출
  const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'

  // Context에 에러 상태 저장
  dispatch({
    type: 'SET_ERROR',
    payload: errorMessage,
  })

  // 사용자에게 alert로 에러 알림
  alert(`게임 초기화 실패\n\n${errorMessage}`)

  console.error('[Game Initialization Error]', error)
}
```

**상세 에러 메시지** (`gameApi.ts`):
```typescript
catch (error) {
  console.error('[API Error] Failed to start game:', error)

  if (axios.isAxiosError(error)) {
    if (error.response) {
      // 서버가 응답을 반환했지만 에러 상태 코드
      throw new Error(`서버 오류: ${error.response.status}`)
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함
      throw new Error('서버 연결에 실패했습니다')
    }
  }

  // 기타 에러
  throw new Error('게임 시작에 실패했습니다')
}
```

**UI에서 에러 표시** (`App.tsx`):
```typescript
// 에러 발생 시
if (state.error) {
  return (
    <GameContainer>
      <ErrorContainer>
        <div>⚠️ 게임을 시작할 수 없습니다</div>
        <div>{state.error}</div>
      </ErrorContainer>
    </GameContainer>
  )
}
```

**ErrorContainer 스타일**:
```typescript
const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};      // 16px
  padding: ${({ theme }) => theme.spacing.xl};  // 32px
  color: ${({ theme }) => theme.colors.danger}; // #e74c3c
  font-size: ${({ theme }) => theme.fontSizes.md};  // 16px
  text-align: center;
`
```

**검증:**
- ✅ try-catch로 에러 핸들링
- ✅ alert로 에러 메시지 표시
- ✅ Context에 에러 상태 저장
- ✅ UI에 에러 메시지 표시
- ✅ 에러 타입별 명확한 메시지 (서버 오류, 연결 실패, 기타)

---

## 🧪 검증 방법

### 1. TypeScript 컴파일 체크
```bash
npx tsc --noEmit
```
**결과**: ✅ 에러 없음

### 2. 빌드 테스트
```bash
npm run build
```
**결과**: ✅ 성공 (386ms)
```
✓ 100 modules transformed.
dist/index.html                   0.46 kB
dist/assets/index-DQ3P1g1z.css    0.91 kB
dist/assets/index-DhLlLuyY.js   270.95 kB (axios 추가로 인한 증가)
✓ built in 386ms
```

### 3. 코드 검증
- ✅ gameApi.ts 파일 생성 완료
- ✅ useGameInitializer.ts 파일 생성 완료
- ✅ App.tsx 수정 완료 (GameProvider 적용)
- ✅ 모든 import 문 정상 작동
- ✅ 타입 안전성 확보

---

## 📂 생성/수정된 파일

### 새 파일
1. ✅ `frontend/src/api/gameApi.ts` (67줄)
   - startGame() 함수
   - GameStartResponse 타입
   - 에러 핸들링 로직

2. ✅ `frontend/src/hooks/useGameInitializer.ts` (66줄)
   - useGameInitializer 훅
   - 게임 초기화 로직
   - 로딩/에러 상태 관리

### 수정된 파일
3. ✅ `frontend/src/App.tsx` (주요 변경)
   - GameProvider로 전체 앱 래핑
   - Game 컴포넌트 분리
   - 더미 데이터 제거
   - Context 기반 상태 관리
   - 로딩/에러 UI 추가

**주요 구성 요소:**
- startGame() API 클라이언트
- useGameInitializer 커스텀 훅
- GameProvider 적용
- Loading/Error 컨테이너
- Game 컴포넌트

---

## 🎓 소프트웨어 공학적 가치

### Custom Hook 패턴

**비즈니스 로직 분리:**
```typescript
// ❌ 컴포넌트에 로직 직접 작성
function App() {
  useEffect(() => {
    // API 호출 로직...
  }, [])
}

// ✅ 커스텀 훅으로 분리
function useGameInitializer() {
  // API 호출 로직
}

function App() {
  useGameInitializer()
}
```

**장점:**
- 재사용성: 여러 컴포넌트에서 동일한 로직 사용 가능
- 테스트 용이성: 훅만 독립적으로 테스트 가능
- 관심사의 분리: UI와 비즈니스 로직 분리
- 가독성: 컴포넌트 코드가 간결해짐

### API 클라이언트 추상화

**중앙화된 API 호출:**
```typescript
// src/api/gameApi.ts
export async function startGame() {
  // API 호출 로직 중앙화
}

// 여러 컴포넌트에서 재사용
const { gameId, cards } = await startGame()
```

**장점:**
- DRY (Don't Repeat Yourself): 중복 코드 제거
- 단일 책임 원칙: API 통신만 담당
- 에러 핸들링 중앙화: 일관된 에러 처리
- 타입 안전성: TypeScript로 응답 타입 보장

### 에러 핸들링 전략

**계층적 에러 처리:**
```
API 클라이언트 (gameApi.ts)
  ↓ (에러 타입 분류 및 메시지 생성)
커스텀 훅 (useGameInitializer.ts)
  ↓ (Context에 저장 + alert 표시)
UI 컴포넌트 (App.tsx)
  ↓ (ErrorContainer로 시각적 표시)
```

**장점:**
- 사용자 경험 향상: 명확한 에러 메시지
- 디버깅 용이: console.error로 상세 로그
- 복구 가능성: 에러 상태를 Context에 저장

### 로딩 상태 관리

**UX 개선:**
```typescript
if (state.isLoading) {
  return <LoadingContainer>Loading...</LoadingContainer>
}
```

**장점:**
- 사용자 피드백: 로딩 중임을 명확히 표시
- 사용자 이탈 방지: 화면이 멈춘 것처럼 보이지 않음
- 예측 가능성: 사용자가 대기 시간을 인지

### Provider 패턴

**전역 상태 제공:**
```typescript
<GameProvider>
  <App />
</GameProvider>
```

**장점:**
- Props Drilling 방지: 중간 컴포넌트를 거치지 않음
- 전역 상태 관리: 어디서든 useGameContext() 호출 가능
- 컴포넌트 분리: Provider 내부에서만 Context 사용 가능

---

## 🔄 데이터 흐름

### 게임 초기화 흐름

```
1. 컴포넌트 마운트
   ↓
2. useGameInitializer 실행
   ↓
3. useEffect 트리거 (마운트 시 한 번)
   ↓
4. gameId === null 확인 (중복 호출 방지)
   ↓
5. SET_LOADING(true) 디스패치
   ↓
6. UI: Loading... 표시
   ↓
7. startGame() API 호출
   ↓
8. 백엔드: GET /api/game/start
   ↓
9. 백엔드 응답: { gameId, cards }
   ↓
10. 타입 변환: isFlipped, isSolved 추가
   ↓
11. INIT_GAME 디스패치
   ↓
12. Context 업데이트
   ↓
13. UI: 게임 화면 렌더링
```

### 에러 발생 시 흐름

```
API 호출 실패
  ↓
catch 블록 실행
  ↓
에러 메시지 추출
  ↓
SET_ERROR 디스패치
  ↓
alert 표시 ("게임 초기화 실패")
  ↓
UI: ErrorContainer 렌더링
```

---

## 🎯 타입 변환 로직

### 백엔드 응답 → 프론트엔드 Card

**백엔드 Card 타입:**
```typescript
{
  id: string
  type: string
  imgUrl: string
}
```

**프론트엔드 Card 타입:**
```typescript
{
  id: string
  type: string
  imgUrl: string
  isFlipped: boolean  // 추가
  isSolved: boolean   // 추가
}
```

**변환 로직** (`gameApi.ts`):
```typescript
const cards: Card[] = response.data.cards.map((card) => ({
  ...card,
  isFlipped: false,
  isSolved: false,
}))
```

**Why:**
- 백엔드는 카드 생성만 담당 (상태 없음)
- 프론트엔드는 카드 상태 관리 (게임 플레이)
- 관심사의 분리 (Separation of Concerns)

---

## 📊 상태 전환 다이어그램

```
IDLE (초기 상태)
  ↓ (useGameInitializer 실행)
LOADING (API 호출 중)
  ↓ (성공)
PLAYING (게임 진행)

  ↓ (실패)
ERROR (에러 상태)
```

---

## 🚀 다음 단계 준비

**Issue #38**: [Phase 5] 카드 클릭 핸들러 및 Flip 상태 관리
- handleCardClick 함수 구현
- FLIP_CARD 액션 디스패치
- Guard Clause로 엣지 케이스 처리
  - 이미 Flipped 카드 클릭 무시
  - 이미 Solved 카드 클릭 무시
  - flippedCards가 2개일 때 다른 카드 클릭 무시

**Issue #39**: [Phase 5] 카드 매칭 판별 로직 (useEffect)
- flippedCards.length === 2일 때 매칭 판별
- MATCH_SUCCESS / MATCH_FAIL 디스패치
- setTimeout으로 1초 후 카드 뒤집기

---

## ⚠️  참고 사항

### 백엔드 서버 실행 필요
현재 프론트엔드 코드는 완성되었지만, 실제 동작을 확인하려면 백엔드 서버가 실행되어야 합니다.

**백엔드 서버 실행 방법:**
```bash
cd backend
npm run dev
```

**확인 방법:**
```bash
curl http://localhost:3001/api/game/start
```

**예상 응답:**
```json
{
  "gameId": "abc-123-def-456",
  "cards": [
    { "id": "1", "type": "apple", "imgUrl": "/images/apple.png" },
    // ... 16개 카드
  ]
}
```

### Vite Proxy 설정 확인
프론트엔드에서 `/api/*` 경로는 자동으로 `http://localhost:3001`로 프록시됩니다.

**vite.config.ts:**
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
},
```

### 중복 호출 방지
useGameInitializer는 `gameId`와 `isLoading` 상태를 체크하여 중복 호출을 방지합니다.

```typescript
if (state.gameId !== null || state.isLoading) {
  return  // 이미 초기화되었거나 로딩 중이면 건너뜀
}
```

---

## ✅ 결론

**모든 Acceptance Criteria 통과 ✅**

1. ✅ useGameInitializer 훅 생성 완료
2. ✅ 컴포넌트 마운트 시 API 호출
3. ✅ 응답 데이터를 Context에 저장
4. ✅ 로딩 중일 때 로딩 표시
5. ✅ API 실패 시 에러 메시지 표시
6. ✅ TypeScript 컴파일 및 빌드 성공
7. ✅ 백엔드 Card 타입 → 프론트엔드 Card 타입 변환
8. ✅ 중복 호출 방지 로직
9. ✅ 계층적 에러 핸들링

**소프트웨어 공학 원칙 준수:**
- Custom Hook 패턴 (비즈니스 로직 분리)
- API 클라이언트 추상화 (중앙화된 API 호출)
- Provider 패턴 (전역 상태 관리)
- 에러 핸들링 전략 (계층적 에러 처리)
- 로딩 상태 관리 (UX 개선)
- 관심사의 분리 (UI vs 로직)
- DRY 원칙 (코드 중복 제거)
- 타입 안전성 (TypeScript)

**Phase 5 (1/5) 완료! 🎉**
