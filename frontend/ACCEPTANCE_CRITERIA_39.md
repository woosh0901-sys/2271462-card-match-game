# Issue #39: Acceptance Criteria 검증 결과

## ✅ Acceptance Criteria 체크리스트

### AC 1: flippedCards.length === 2일 때 useEffect가 실행되는가?

**✅ 통과**

**파일 위치**: `frontend/src/App.tsx`

**useEffect 구조**:
```typescript
useEffect(() => {
  // flippedCards가 정확히 2개일 때만 실행
  if (state.flippedCards.length !== 2) {
    return
  }

  // 매칭 판별 로직...
}, [state.flippedCards, dispatch])
```

**동작 방식:**
```
카드 1 클릭
  ↓
FLIP_CARD 디스패치
  ↓
flippedCards.length === 1 (useEffect 실행 안 됨)
  ↓
카드 2 클릭
  ↓
FLIP_CARD 디스패치
  ↓
flippedCards.length === 2 (✅ useEffect 실행!)
  ↓
매칭 판별 로직 실행
```

**의존성 배열:**
- `state.flippedCards`: flippedCards 상태 변경 시 실행
- `dispatch`: 리렌더링 시에도 동일한 함수 참조 유지

**검증:**
- ✅ flippedCards.length === 2일 때만 실행
- ✅ 의존성 배열 정확히 설정
- ✅ 조기 종료 (length !== 2)
- ✅ 불필요한 렌더링 방지

---

### AC 2: 두 카드가 일치하면 앞면 상태로 고정되는가?

**✅ 통과**

**매칭 성공 로직**:
```typescript
if (firstCard.type === secondCard.type) {
  // 매칭 성공: 즉시 MATCH_SUCCESS 디스패치
  console.log('[Matching] Success:', firstCard.type)
  dispatch({
    type: 'MATCH_SUCCESS',
    payload: { cardIds: [firstCard.id, secondCard.id] },
  })
  // 매칭 판별 종료
  dispatch({ type: 'SET_MATCHING', payload: false })
}
```

**GameContext의 MATCH_SUCCESS Reducer**:
```typescript
case 'MATCH_SUCCESS':
  // 매칭 성공: 두 카드의 isSolved를 true로 변경하고 flippedCards 비우기
  return {
    ...state,
    cards: state.cards.map((card) =>
      action.payload.cardIds.includes(card.id)
        ? { ...card, isSolved: true }  // ✅ isSolved = true
        : card
    ),
    flippedCards: [],  // ✅ flippedCards 비우기
  }
```

**Card 컴포넌트에서 앞면 고정**:
```typescript
const { type, isFlipped, isSolved } = cardData

// 카드가 뒤집혔거나 짝이 맞춰진 경우 앞면 표시
const showFront = isFlipped || isSolved  // ✅ isSolved === true면 항상 앞면

return (
  <CardContainer onClick={onClick}>
    {showFront ? (
      <CardFront>
        <CardTypeText>{type}</CardTypeText>  // ✅ 앞면 고정
      </CardFront>
    ) : (
      <CardBack />
    )}
  </CardContainer>
)
```

**동작 흐름:**
```
두 카드의 type 일치
  ↓
MATCH_SUCCESS 디스패치
  ↓
Reducer 실행
  ↓
두 카드의 isSolved = true
  ↓
flippedCards = []
  ↓
React 리렌더링
  ↓
Card 컴포넌트: showFront = true (isSolved === true)
  ↓
✅ 앞면 상태로 고정 (클릭해도 뒤집히지 않음)
```

**검증:**
- ✅ MATCH_SUCCESS 디스패치
- ✅ isSolved = true로 변경
- ✅ flippedCards 비우기
- ✅ Card 컴포넌트에서 앞면 고정
- ✅ 클릭해도 뒤집히지 않음 (Guard Clause 1)

---

### AC 3: 두 카드가 불일치하면 1초 후 뒷면으로 돌아가는가?

**✅ 통과**

**매칭 실패 로직**:
```typescript
else {
  // 매칭 실패: 1초 후 MATCH_FAIL 디스패치
  console.log('[Matching] Fail:', firstCard.type, 'vs', secondCard.type)
  const timeoutId = setTimeout(() => {
    dispatch({
      type: 'MATCH_FAIL',
      payload: { cardIds: [firstCard.id, secondCard.id] },
    })
    // 매칭 판별 종료
    dispatch({ type: 'SET_MATCHING', payload: false })
  }, 1000)  // ✅ 1초 후 실행

  // cleanup 함수: 컴포넌트 언마운트 시 타이머 정리
  return () => clearTimeout(timeoutId)
}
```

**GameContext의 MATCH_FAIL Reducer**:
```typescript
case 'MATCH_FAIL':
  // 매칭 실패: 두 카드의 isFlipped를 false로 변경하고 life 차감
  return {
    ...state,
    cards: state.cards.map((card) =>
      action.payload.cardIds.includes(card.id)
        ? { ...card, isFlipped: false }  // ✅ isFlipped = false
        : card
    ),
    flippedCards: [],  // ✅ flippedCards 비우기
    life: state.life - 1,  // ✅ life 차감
  }
```

**동작 흐름:**
```
두 카드의 type 불일치
  ↓
setTimeout(1000) 시작
  ↓
1초 대기 (사용자가 카드 확인)
  ↓
MATCH_FAIL 디스패치
  ↓
Reducer 실행
  ↓
두 카드의 isFlipped = false
  ↓
flippedCards = []
  ↓
life = life - 1
  ↓
React 리렌더링
  ↓
Card 컴포넌트: showFront = false
  ↓
✅ 뒷면으로 돌아감
```

**Why 1초?**
- 사용자가 두 카드를 확인할 시간 제공
- UX 개선: 너무 빠르면 사용자가 카드를 인지하지 못함
- 게임의 학습 곡선: 카드 위치를 기억할 시간

**cleanup 함수:**
```typescript
return () => clearTimeout(timeoutId)
```

**Why cleanup?**
- 컴포넌트 언마운트 시 타이머 정리
- 메모리 누수 방지
- React의 Best Practice

**검증:**
- ✅ setTimeout으로 1초 대기
- ✅ MATCH_FAIL 디스패치
- ✅ isFlipped = false로 변경
- ✅ flippedCards 비우기
- ✅ life 차감
- ✅ cleanup 함수로 타이머 정리

---

### AC 4: 매칭 판별 중에는 다른 카드 클릭이 차단되는가?

**✅ 통과**

**isMatching 플래그 추가** (`GameState.ts`):
```typescript
export interface GameState {
  // ...
  isMatching: boolean;  // ✅ 매칭 판별 중 여부
}
```

**매칭 판별 시작**:
```typescript
useEffect(() => {
  if (state.flippedCards.length !== 2) {
    return
  }

  // 매칭 판별 시작
  dispatch({ type: 'SET_MATCHING', payload: true })  // ✅ isMatching = true

  // 매칭 판별 로직...
}, [state.flippedCards, dispatch])
```

**매칭 판별 종료**:
```typescript
// 매칭 성공 시
dispatch({ type: 'SET_MATCHING', payload: false })  // ✅ isMatching = false

// 매칭 실패 시 (1초 후)
setTimeout(() => {
  dispatch({ type: 'MATCH_FAIL', payload: { cardIds } })
  dispatch({ type: 'SET_MATCHING', payload: false })  // ✅ isMatching = false
}, 1000)
```

**handleCardClick에서 isMatching 체크** (Guard Clause 4):
```typescript
// Guard Clause 4: 매칭 판별 중일 때는 클릭 무시
if (state.isMatching) {
  console.log('[Card Click] Ignored: Matching in progress')
  return  // ✅ 조기 종료
}
```

**동작 흐름:**
```
카드 2 클릭
  ↓
flippedCards.length === 2
  ↓
useEffect 실행
  ↓
SET_MATCHING(true) 디스패치
  ↓
✅ isMatching = true
  ↓
사용자가 카드 3을 클릭 시도
  ↓
handleCardClick(cardId3) 호출
  ↓
Guard Clause 4: isMatching === true
  ↓
console.log("Ignored: Matching in progress")
  ↓
return (조기 종료)
  ↓
✅ 카드 3이 뒤집히지 않음
  ↓
매칭 판별 완료 (성공 or 1초 후 실패)
  ↓
SET_MATCHING(false) 디스패치
  ↓
✅ isMatching = false (다시 클릭 가능)
```

**검증:**
- ✅ GameState에 isMatching 플래그 추가
- ✅ SET_MATCHING 액션 정의
- ✅ Reducer에서 SET_MATCHING 처리
- ✅ 매칭 판별 시작 시 isMatching = true
- ✅ 매칭 판별 완료 시 isMatching = false
- ✅ handleCardClick에서 isMatching 체크 (Guard Clause 4)
- ✅ 매칭 판별 중 카드 클릭 차단

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
**결과**: ✅ 성공 (412ms)
```
✓ 100 modules transformed.
dist/index.html                   0.46 kB
dist/assets/index-DQ3P1g1z.css    0.91 kB
dist/assets/index-S3OEk35u.js   272.03 kB
✓ built in 412ms
```

### 3. 코드 검증
- ✅ GameState.ts 수정 (isMatching 추가)
- ✅ GameContext.tsx 수정 (SET_MATCHING 처리)
- ✅ App.tsx 수정 (useEffect, Guard Clause 4)
- ✅ 타입 안전성 확보

---

## 📂 수정된 파일

### 수정
1. ✅ `frontend/src/types/GameState.ts`
   - isMatching 플래그 추가
   - SET_MATCHING 액션 타입 추가

2. ✅ `frontend/src/contexts/GameContext.tsx`
   - initialState에 isMatching: false 추가
   - INIT_GAME에 isMatching: false 추가
   - SET_MATCHING 케이스 추가

3. ✅ `frontend/src/App.tsx` (주요 변경)
   - useEffect import 추가
   - Guard Clause 4 추가 (isMatching 체크)
   - 매칭 판별 로직 useEffect 추가
   - MATCH_SUCCESS / MATCH_FAIL 디스패치
   - setTimeout으로 1초 대기
   - cleanup 함수로 타이머 정리

**주요 구성 요소:**
- isMatching 플래그
- SET_MATCHING 액션
- useEffect 매칭 판별 로직
- Guard Clause 4

---

## 🎓 소프트웨어 공학적 가치

### 1. useEffect의 의존성 배열

**정의:**
useEffect는 의존성 배열에 지정된 값이 변경될 때만 실행됩니다.

**구현:**
```typescript
useEffect(() => {
  // flippedCards가 변경될 때만 실행
}, [state.flippedCards, dispatch])
```

**장점:**
- 불필요한 렌더링 방지
- 성능 최적화
- 특정 상태 변경에만 반응
- React의 선언적 프로그래밍 패러다임

**Why dispatch도 포함?**
- ESLint 규칙 준수
- dispatch는 stable reference (변하지 않음)
- 명확한 의도 표현

---

### 2. setTimeout과 cleanup 함수

**setTimeout 사용:**
```typescript
const timeoutId = setTimeout(() => {
  dispatch({ type: 'MATCH_FAIL', payload: { cardIds } })
}, 1000)
```

**Why 1초?**
- 사용자 경험(UX): 카드를 확인할 시간 제공
- 학습 곡선: 카드 위치를 기억할 시간
- 게임의 재미: 너무 빠르면 스트레스

**cleanup 함수:**
```typescript
return () => clearTimeout(timeoutId)
```

**Why cleanup?**
- 메모리 누수 방지
- 컴포넌트 언마운트 시 타이머 정리
- React의 Best Practice
- 예측 가능한 동작

---

### 3. 플래그 기반 상태 관리

**isMatching 플래그:**
```typescript
isMatching: boolean
```

**장점:**
- 명확한 상태 표현
- 코드 가독성 향상
- 엣지 케이스 처리 용이
- 디버깅 쉬움

**대안: flippedCards.length === 2 체크**
```typescript
// ❌ 좋지 않은 방법
if (state.flippedCards.length === 2) {
  // 클릭 차단
}
```

**Why isMatching이 더 나은가?**
- 의도가 명확함 ("매칭 판별 중"이라는 의미)
- flippedCards.length === 2는 일시적 상태
- isMatching은 매칭 판별 시작부터 종료까지 유지
- 코드 유지보수 용이

---

### 4. 조건부 로직 최적화

**조기 종료 (Early Return):**
```typescript
useEffect(() => {
  if (state.flippedCards.length !== 2) {
    return  // 조기 종료
  }

  // 실제 로직
}, [state.flippedCards, dispatch])
```

**장점:**
- 불필요한 연산 방지
- 가독성 향상
- Guard Clause 패턴과 일관성

---

### 5. 단일 책임 원칙 (SRP)

**useEffect의 책임:**
1. flippedCards.length === 2 감지
2. 매칭 판별 (type 비교)
3. 성공 시 MATCH_SUCCESS 디스패치
4. 실패 시 1초 후 MATCH_FAIL 디스패치
5. isMatching 플래그 관리

**분리된 책임:**
```
handleCardClick (카드 뒤집기)
  ↓
useEffect (매칭 판별)
  ↓
Reducer (상태 변경)
  ↓
Card Component (UI)
```

---

## 🔄 데이터 흐름

### 매칭 성공 흐름

```
카드 1 클릭
  ↓
FLIP_CARD 디스패치
  ↓
flippedCards = [card1]
  ↓
카드 2 클릭
  ↓
FLIP_CARD 디스패치
  ↓
flippedCards = [card1, card2]
  ↓
useEffect 실행 (flippedCards.length === 2)
  ↓
SET_MATCHING(true)
  ↓
type 비교: card1.type === card2.type
  ↓
MATCH_SUCCESS 디스패치
  ↓
Reducer: isSolved = true, flippedCards = []
  ↓
SET_MATCHING(false)
  ↓
React 리렌더링
  ↓
✅ 앞면 고정
```

### 매칭 실패 흐름

```
카드 1 클릭
  ↓
FLIP_CARD 디스패치
  ↓
flippedCards = [card1]
  ↓
카드 2 클릭
  ↓
FLIP_CARD 디스패치
  ↓
flippedCards = [card1, card2]
  ↓
useEffect 실행 (flippedCards.length === 2)
  ↓
SET_MATCHING(true) (✅ 카드 클릭 차단)
  ↓
type 비교: card1.type !== card2.type
  ↓
setTimeout(1000) 시작
  ↓
1초 대기 (사용자가 카드 확인)
  ↓
MATCH_FAIL 디스패치
  ↓
Reducer: isFlipped = false, flippedCards = [], life -= 1
  ↓
SET_MATCHING(false) (✅ 카드 클릭 가능)
  ↓
React 리렌더링
  ↓
✅ 뒷면으로 돌아감
```

---

## 📊 상태 변경 다이어그램

### 매칭 성공 시 상태 변경

**Before:**
```typescript
{
  cards: [
    { id: '1', type: 'apple', isFlipped: true, isSolved: false },
    { id: '2', type: 'apple', isFlipped: true, isSolved: false },
  ],
  flippedCards: [card1, card2],
  isMatching: true,
}
```

**After:**
```typescript
{
  cards: [
    { id: '1', type: 'apple', isFlipped: true, isSolved: true },  // ✅
    { id: '2', type: 'apple', isFlipped: true, isSolved: true },  // ✅
  ],
  flippedCards: [],  // ✅
  isMatching: false,  // ✅
}
```

### 매칭 실패 시 상태 변경

**Before:**
```typescript
{
  cards: [
    { id: '1', type: 'apple', isFlipped: true, isSolved: false },
    { id: '2', type: 'banana', isFlipped: true, isSolved: false },
  ],
  flippedCards: [card1, card2],
  life: 3,
  isMatching: true,
}
```

**After (1초 후):**
```typescript
{
  cards: [
    { id: '1', type: 'apple', isFlipped: false, isSolved: false },  // ✅
    { id: '2', type: 'banana', isFlipped: false, isSolved: false },  // ✅
  ],
  flippedCards: [],  // ✅
  life: 2,  // ✅
  isMatching: false,  // ✅
}
```

---

## 🎯 타이밍 다이어그램

```
Time: 0초
  ↓
  카드 2 클릭
  ↓
  flippedCards.length === 2
  ↓
  useEffect 실행
  ↓
  SET_MATCHING(true)
  ↓
  [매칭 실패 케이스]
  ↓
Time: 0초 ~ 1초
  ↓
  사용자가 카드 확인
  ↓
  (카드 클릭 차단: isMatching === true)
  ↓
Time: 1초
  ↓
  MATCH_FAIL 디스패치
  ↓
  isFlipped = false
  ↓
  life -= 1
  ↓
  SET_MATCHING(false)
  ↓
  ✅ 카드 클릭 다시 가능
```

---

## 🚀 다음 단계 준비

**Issue #40**: [Phase 5] Life 차감 로직 및 게임 오버 판정
- MATCH_FAIL에서 life 차감 (✅ 이미 구현됨)
- life === 0일 때 GAME_OVER 디스패치
- 게임 오버 상태에서 카드 클릭 차단

**Issue #41**: [Phase 5] 승리 조건 판정 로직
- useEffect로 모든 카드의 isSolved 체크
- 모든 카드가 Solved이면 VICTORY 디스패치

---

## ⚠️  참고 사항

### Life 차감은 이미 구현됨
MATCH_FAIL Reducer에서 `life: state.life - 1`로 이미 구현되어 있습니다.
Issue #40에서는 life === 0일 때 GAME_OVER 처리만 추가하면 됩니다.

### setTimeout의 메모리 누수 방지
cleanup 함수로 컴포넌트 언마운트 시 타이머를 정리합니다.
```typescript
return () => clearTimeout(timeoutId)
```

### 디버깅 로그
개발 환경에서 매칭 판별 과정을 추적할 수 있도록 로그를 추가했습니다.
```typescript
console.log('[Matching] Success:', firstCard.type)
console.log('[Matching] Fail:', firstCard.type, 'vs', secondCard.type)
```

---

## ✅ 결론

**모든 Acceptance Criteria 통과 ✅**

1. ✅ flippedCards.length === 2일 때 useEffect 실행
2. ✅ 매칭 성공 시 앞면 고정 (isSolved = true)
3. ✅ 매칭 실패 시 1초 후 뒷면으로 (setTimeout)
4. ✅ 매칭 판별 중 카드 클릭 차단 (isMatching)
5. ✅ TypeScript 컴파일 및 빌드 성공
6. ✅ 타입 안전성 확보
7. ✅ cleanup 함수로 메모리 누수 방지
8. ✅ 명확한 로그 메시지

**소프트웨어 공학 원칙 준수:**
- useEffect 의존성 배열 (성능 최적화)
- setTimeout과 cleanup 함수 (메모리 관리)
- 플래그 기반 상태 관리 (명확한 의도)
- 조건부 로직 최적화 (조기 종료)
- 단일 책임 원칙 (매칭 판별만 담당)
- 사용자 경험 고려 (1초 대기)

**Phase 5 (3/5) 완료! 🎉**
