# Issue #38: Acceptance Criteria 검증 결과

## ✅ Acceptance Criteria 체크리스트

### AC 1: handleCardClick 함수가 작성되었는가?

**✅ 통과**

**파일 위치**: `frontend/src/App.tsx`

**함수 구조**:
```typescript
const handleCardClick = (cardId: string) => {
  // 클릭한 카드 찾기
  const clickedCard = state.cards.find((card) => card.id === cardId)

  // 카드를 찾지 못한 경우
  if (!clickedCard) {
    console.warn('[Card Click] Card not found:', cardId)
    return
  }

  // Guard Clause 1: 이미 짝이 맞춰진 카드는 클릭 무시
  if (clickedCard.isSolved) {
    console.log('[Card Click] Ignored: Card already solved')
    return
  }

  // Guard Clause 2: 이미 뒤집힌 카드는 클릭 무시
  if (clickedCard.isFlipped) {
    console.log('[Card Click] Ignored: Card already flipped')
    return
  }

  // Guard Clause 3: 이미 2장이 뒤집혀 있으면 클릭 무시
  if (state.flippedCards.length >= 2) {
    console.log('[Card Click] Ignored: Two cards already flipped')
    return
  }

  // 모든 Guard Clause를 통과하면 카드 뒤집기
  console.log('[Card Click] Flipping card:', cardId)
  dispatch({ type: 'FLIP_CARD', payload: { cardId } })
}
```

**검증:**
- ✅ handleCardClick 함수 작성 완료
- ✅ cardId 매개변수 받아서 처리
- ✅ Guard Clause 패턴 사용
- ✅ 명확한 로직 흐름

---

### AC 2: Solved 카드를 클릭해도 상태가 변하지 않는가?

**✅ 통과**

**Guard Clause 1**:
```typescript
// Guard Clause 1: 이미 짝이 맞춰진 카드는 클릭 무시
if (clickedCard.isSolved) {
  console.log('[Card Click] Ignored: Card already solved')
  return  // ✅ 조기 종료 - 액션 디스패치 없음
}
```

**동작 방식:**
```
사용자가 Solved 카드 클릭
  ↓
handleCardClick(cardId) 호출
  ↓
clickedCard.isSolved === true 확인
  ↓
console.log("Ignored: Card already solved")
  ↓
return (조기 종료)
  ↓
✅ FLIP_CARD 액션이 디스패치되지 않음
  ↓
✅ 상태 변경 없음
```

**검증:**
- ✅ isSolved === true 체크
- ✅ 조기 종료 (return)
- ✅ FLIP_CARD 액션 디스패치 안 됨
- ✅ 상태 변경 없음
- ✅ 디버깅을 위한 로그 출력

---

### AC 3: 이미 Flipped 카드를 클릭해도 중복으로 추가되지 않는가?

**✅ 통과**

**Guard Clause 2**:
```typescript
// Guard Clause 2: 이미 뒤집힌 카드는 클릭 무시
if (clickedCard.isFlipped) {
  console.log('[Card Click] Ignored: Card already flipped')
  return  // ✅ 조기 종료 - 중복 추가 방지
}
```

**동작 방식:**
```
사용자가 이미 뒤집힌 카드를 다시 클릭
  ↓
handleCardClick(cardId) 호출
  ↓
clickedCard.isFlipped === true 확인
  ↓
console.log("Ignored: Card already flipped")
  ↓
return (조기 종료)
  ↓
✅ FLIP_CARD 액션이 디스패치되지 않음
  ↓
✅ flippedCards 배열에 중복으로 추가되지 않음
```

**검증:**
- ✅ isFlipped === true 체크
- ✅ 조기 종료 (return)
- ✅ 중복 클릭 방지
- ✅ flippedCards 배열 오염 방지

---

### AC 4: flippedCards가 2개일 때 다른 카드 클릭이 무시되는가?

**✅ 통과**

**Guard Clause 3**:
```typescript
// Guard Clause 3: 이미 2장이 뒤집혀 있으면 클릭 무시
if (state.flippedCards.length >= 2) {
  console.log('[Card Click] Ignored: Two cards already flipped')
  return  // ✅ 조기 종료 - 3번째 카드 클릭 방지
}
```

**동작 방식:**
```
2개의 카드가 이미 뒤집혀 있음 (매칭 판별 대기 중)
  ↓
사용자가 3번째 카드를 클릭
  ↓
handleCardClick(cardId) 호출
  ↓
state.flippedCards.length === 2 확인
  ↓
console.log("Ignored: Two cards already flipped")
  ↓
return (조기 종료)
  ↓
✅ FLIP_CARD 액션이 디스패치되지 않음
  ↓
✅ 3번째 카드가 뒤집히지 않음
```

**Why:**
- 매칭 판별 로직(Issue #39)이 실행되는 동안 새로운 카드 클릭을 방지
- 게임 규칙: 한 번에 최대 2장만 뒤집을 수 있음
- UX 개선: 혼란스러운 상황 방지

**검증:**
- ✅ flippedCards.length >= 2 체크
- ✅ 조기 종료 (return)
- ✅ 3번째 카드 클릭 방지
- ✅ 게임 규칙 준수

---

### AC 5: 카드를 클릭하면 앞면이 보이는가?

**✅ 통과**

**FLIP_CARD 액션 디스패치**:
```typescript
// 모든 Guard Clause를 통과하면 카드 뒤집기
console.log('[Card Click] Flipping card:', cardId)
dispatch({ type: 'FLIP_CARD', payload: { cardId } })
```

**GameContext의 FLIP_CARD Reducer**:
```typescript
case 'FLIP_CARD':
  return {
    ...state,
    cards: state.cards.map((card) =>
      card.id === action.payload.cardId
        ? { ...card, isFlipped: true }  // ✅ isFlipped를 true로 변경
        : card
    ),
    flippedCards: [
      ...state.flippedCards,
      state.cards.find((card) => card.id === action.payload.cardId)!,
    ],
  }
```

**Card 컴포넌트에서 앞면 표시**:
```typescript
// Card.tsx
const { type, isFlipped, isSolved } = cardData

// 카드가 뒤집혔거나 짝이 맞춰진 경우 앞면 표시
const showFront = isFlipped || isSolved

return (
  <CardContainer onClick={onClick}>
    {showFront ? (
      <CardFront>
        <CardTypeText>{type}</CardTypeText>  // ✅ 앞면 표시
      </CardFront>
    ) : (
      <CardBack />  // 뒷면 표시
    )}
  </CardContainer>
)
```

**동작 흐름:**
```
사용자가 카드 클릭
  ↓
handleCardClick(cardId) 호출
  ↓
모든 Guard Clause 통과
  ↓
dispatch({ type: 'FLIP_CARD', payload: { cardId } })
  ↓
GameContext의 Reducer 실행
  ↓
해당 카드의 isFlipped를 true로 변경
  ↓
flippedCards 배열에 카드 추가
  ↓
React 리렌더링
  ↓
Card 컴포넌트에서 showFront === true
  ↓
✅ CardFront 렌더링 (과일 이름 표시)
```

**검증:**
- ✅ FLIP_CARD 액션 디스패치
- ✅ isFlipped를 true로 변경
- ✅ flippedCards 배열에 추가
- ✅ Card 컴포넌트에서 앞면 표시
- ✅ 즉시 UI 업데이트

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
**결과**: ✅ 성공 (383ms)
```
✓ 100 modules transformed.
dist/index.html                   0.46 kB
dist/assets/index-DQ3P1g1z.css    0.91 kB
dist/assets/index-BX6tn0H3.js   271.37 kB
✓ built in 383ms
```

### 3. 코드 검증
- ✅ App.tsx 수정 완료
- ✅ handleCardClick 함수 구현
- ✅ 3개의 Guard Clause 모두 구현
- ✅ FLIP_CARD 액션 디스패치
- ✅ 타입 안전성 확보

---

## 📂 수정된 파일

### 수정
1. ✅ `frontend/src/App.tsx` (주요 변경)
   - handleCardClick 함수 구현
   - dispatch 가져오기 (useGameContext)
   - 3개의 Guard Clause 추가
   - FLIP_CARD 액션 디스패치
   - 디버깅 로그 추가

**주요 구성 요소:**
- Guard Clause 1: isSolved 체크
- Guard Clause 2: isFlipped 체크
- Guard Clause 3: flippedCards.length >= 2 체크
- FLIP_CARD 디스패치

---

## 🎓 소프트웨어 공학적 가치

### Guard Clause 패턴

**정의:**
조건을 만족하지 않을 때 조기 종료(early return)하여 중첩된 if문을 줄이는 패턴입니다.

**Before (중첩된 if문):**
```typescript
// ❌ 중첩된 if문 (가독성 낮음)
const handleCardClick = (cardId: string) => {
  const clickedCard = state.cards.find((card) => card.id === cardId)

  if (clickedCard) {
    if (!clickedCard.isSolved) {
      if (!clickedCard.isFlipped) {
        if (state.flippedCards.length < 2) {
          // 실제 로직
          dispatch({ type: 'FLIP_CARD', payload: { cardId } })
        }
      }
    }
  }
}
```

**After (Guard Clause):**
```typescript
// ✅ Guard Clause 패턴 (가독성 높음)
const handleCardClick = (cardId: string) => {
  const clickedCard = state.cards.find((card) => card.id === cardId)

  if (!clickedCard) return  // Guard Clause
  if (clickedCard.isSolved) return  // Guard Clause
  if (clickedCard.isFlipped) return  // Guard Clause
  if (state.flippedCards.length >= 2) return  // Guard Clause

  // 실제 로직
  dispatch({ type: 'FLIP_CARD', payload: { cardId } })
}
```

**장점:**
1. **가독성 향상**: 중첩 없이 선형적으로 읽힘
2. **유지보수 용이**: 조건 추가/삭제가 쉬움
3. **명확한 의도**: 각 Guard Clause가 명확한 조건을 나타냄
4. **조기 종료**: 불필요한 연산 방지

### Fail-Fast 원칙

**정의:**
문제가 발견되면 즉시 실패(종료)하여 후속 오류를 방지하는 원칙입니다.

**적용:**
```typescript
// 문제 상황 1: 카드를 찾지 못함
if (!clickedCard) {
  console.warn('[Card Click] Card not found:', cardId)
  return  // ✅ 즉시 종료
}

// 문제 상황 2: 이미 Solved
if (clickedCard.isSolved) {
  console.log('[Card Click] Ignored: Card already solved')
  return  // ✅ 즉시 종료
}

// ... 다른 Guard Clause들
```

**장점:**
- 버그 조기 발견
- 디버깅 용이
- 예측 가능한 동작

### 단일 책임 원칙 (SRP)

**handleCardClick의 책임:**
1. **입력 검증**: 카드 ID 유효성 확인
2. **엣지 케이스 처리**: Guard Clause로 비정상 상황 차단
3. **액션 디스패치**: FLIP_CARD 액션 전달

**분리된 책임:**
```
handleCardClick (입력 검증 + 엣지 케이스)
  ↓
Reducer (상태 변경 로직)
  ↓
Card Component (UI 렌더링)
```

### 로깅 전략

**디버깅을 위한 명확한 로그:**
```typescript
console.log('[Card Click] Ignored: Card already solved')  // 무시된 이유 명시
console.log('[Card Click] Ignored: Card already flipped')  // 무시된 이유 명시
console.log('[Card Click] Ignored: Two cards already flipped')  // 무시된 이유 명시
console.log('[Card Click] Flipping card:', cardId)  // 정상 동작
```

**장점:**
- 문제 상황을 빠르게 파악
- 사용자 행동 추적
- 버그 재현 용이

---

## 🔄 데이터 흐름

### 정상 흐름 (카드 뒤집기)

```
사용자가 카드 클릭
  ↓
Card 컴포넌트의 onClick 호출
  ↓
GameBoard의 onCardClick 호출
  ↓
Game 컴포넌트의 handleCardClick(cardId) 호출
  ↓
Guard Clause 1: isSolved 체크 (Pass)
  ↓
Guard Clause 2: isFlipped 체크 (Pass)
  ↓
Guard Clause 3: flippedCards.length >= 2 체크 (Pass)
  ↓
dispatch({ type: 'FLIP_CARD', payload: { cardId } })
  ↓
GameContext의 Reducer 실행
  ↓
isFlipped = true, flippedCards에 추가
  ↓
React 리렌더링
  ↓
Card 컴포넌트에서 앞면 표시
```

### Guard Clause에 의한 조기 종료

```
사용자가 이미 Solved 카드 클릭
  ↓
handleCardClick(cardId) 호출
  ↓
Guard Clause 1: isSolved === true
  ↓
console.log("Ignored: Card already solved")
  ↓
return (조기 종료)
  ↓
✅ 후속 로직 실행 안 됨
  ↓
✅ 상태 변경 없음
```

---

## 🎯 엣지 케이스 처리

### 1. 존재하지 않는 카드 ID

**상황**: 잘못된 cardId가 전달됨

**처리**:
```typescript
const clickedCard = state.cards.find((card) => card.id === cardId)

if (!clickedCard) {
  console.warn('[Card Click] Card not found:', cardId)
  return
}
```

**결과**: 조기 종료, 에러 로그

---

### 2. 이미 짝이 맞춰진 카드 클릭

**상황**: isSolved === true인 카드 클릭

**처리**:
```typescript
if (clickedCard.isSolved) {
  console.log('[Card Click] Ignored: Card already solved')
  return
}
```

**결과**: 클릭 무시, 상태 변경 없음

---

### 3. 이미 뒤집힌 카드 재클릭

**상황**: isFlipped === true인 카드를 다시 클릭

**처리**:
```typescript
if (clickedCard.isFlipped) {
  console.log('[Card Click] Ignored: Card already flipped')
  return
}
```

**결과**: 중복 클릭 방지, flippedCards 오염 방지

---

### 4. 2장 뒤집힌 상태에서 3번째 카드 클릭

**상황**: flippedCards.length === 2인 상태에서 다른 카드 클릭

**처리**:
```typescript
if (state.flippedCards.length >= 2) {
  console.log('[Card Click] Ignored: Two cards already flipped')
  return
}
```

**결과**: 게임 규칙 준수, 매칭 판별 중 클릭 방지

---

## 📊 상태 변경 다이어그램

### FLIP_CARD 액션 전후 상태

**Before:**
```typescript
{
  cards: [
    { id: '1', type: 'apple', isFlipped: false, isSolved: false },
    { id: '2', type: 'banana', isFlipped: false, isSolved: false },
    // ...
  ],
  flippedCards: [],
}
```

**After (카드 1 클릭):**
```typescript
{
  cards: [
    { id: '1', type: 'apple', isFlipped: true, isSolved: false },  // ✅ 변경
    { id: '2', type: 'banana', isFlipped: false, isSolved: false },
    // ...
  ],
  flippedCards: [
    { id: '1', type: 'apple', isFlipped: true, isSolved: false },  // ✅ 추가
  ],
}
```

**After (카드 2 클릭):**
```typescript
{
  cards: [
    { id: '1', type: 'apple', isFlipped: true, isSolved: false },
    { id: '2', type: 'banana', isFlipped: true, isSolved: false },  // ✅ 변경
    // ...
  ],
  flippedCards: [
    { id: '1', type: 'apple', isFlipped: true, isSolved: false },
    { id: '2', type: 'banana', isFlipped: true, isSolved: false },  // ✅ 추가
  ],
}
```

---

## 🚀 다음 단계 준비

**Issue #39**: [Phase 5] 카드 매칭 판별 로직 (useEffect)
- useEffect로 flippedCards.length === 2 감지
- 두 카드의 type 비교
- MATCH_SUCCESS / MATCH_FAIL 디스패치
- setTimeout으로 1초 후 카드 뒤집기

**Issue #40**: [Phase 5] Life 차감 로직 및 게임 오버 판정
- MATCH_FAIL에서 life 차감
- life === 0일 때 GAME_OVER 디스패치
- 게임 오버 상태에서 카드 클릭 차단

**Issue #41**: [Phase 5] 승리 조건 판정 로직
- useEffect로 모든 카드의 isSolved 체크
- 모든 카드가 Solved이면 VICTORY 디스패치

---

## ⚠️  참고 사항

### 매칭 판별 로직은 Issue #39에서 구현
현재 구현은 **카드 뒤집기**만 담당합니다. 매칭 판별 로직은 Issue #39에서 구현됩니다.

**현재 상태:**
- ✅ 카드 클릭 시 뒤집기
- ✅ Guard Clause로 엣지 케이스 처리
- ❌ 매칭 판별 로직 (Issue #39)
- ❌ 자동으로 뒤집기 취소 (Issue #39)

### flippedCards 배열의 역할
- 현재 뒤집힌 카드들을 추적
- Issue #39에서 매칭 판별에 사용
- 최대 2개까지만 허용 (Guard Clause 3)

### 디버깅 로그
개발 환경에서 카드 클릭 동작을 추적할 수 있도록 로그를 추가했습니다.
```typescript
console.log('[Card Click] Flipping card:', cardId)
console.log('[Card Click] Ignored: Card already solved')
console.log('[Card Click] Ignored: Card already flipped')
console.log('[Card Click] Ignored: Two cards already flipped')
```

프로덕션 환경에서는 이러한 로그를 제거하거나 로깅 레벨을 조정할 수 있습니다.

---

## ✅ 결론

**모든 Acceptance Criteria 통과 ✅**

1. ✅ handleCardClick 함수 작성 완료
2. ✅ Solved 카드 클릭 무시 (Guard Clause 1)
3. ✅ 이미 Flipped 카드 중복 클릭 방지 (Guard Clause 2)
4. ✅ flippedCards가 2개일 때 클릭 무시 (Guard Clause 3)
5. ✅ 카드 클릭 시 앞면 표시 (FLIP_CARD 디스패치)
6. ✅ TypeScript 컴파일 및 빌드 성공
7. ✅ 타입 안전성 확보
8. ✅ 명확한 로그 메시지

**소프트웨어 공학 원칙 준수:**
- Guard Clause 패턴 (가독성 향상)
- Fail-Fast 원칙 (조기 종료)
- 단일 책임 원칙 (입력 검증 + 액션 디스패치)
- 로깅 전략 (디버깅 용이성)
- 엣지 케이스 처리 (소프트웨어 품질)

**Phase 5 (2/5) 완료! 🎉**
