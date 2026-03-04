# Issue #40: Acceptance Criteria 검증 결과

## ✅ Acceptance Criteria 체크리스트

### AC 1: 매칭 실패 시 life가 1 감소하는가?

**✅ 통과 (Issue #39에서 이미 구현됨)**

**GameContext의 MATCH_FAIL Reducer** (`src/contexts/GameContext.tsx`):
```typescript
case 'MATCH_FAIL':
  // 매칭 실패: 두 카드의 isFlipped를 false로 변경하고 life 차감
  return {
    ...state,
    cards: state.cards.map((card) =>
      action.payload.cardIds.includes(card.id)
        ? { ...card, isFlipped: false }
        : card
    ),
    flippedCards: [],
    life: state.life - 1,  // ✅ life 차감
  }
```

**동작 흐름:**
```
두 카드의 type 불일치
  ↓
1초 대기
  ↓
MATCH_FAIL 디스패치
  ↓
Reducer 실행
  ↓
life = state.life - 1  // ✅ life 1 감소
  ↓
React 리렌더링
  ↓
Header에 업데이트된 life 표시
```

**예시:**
```typescript
Before: { life: 3 }
After:  { life: 2 }  // ✅ 1 감소
```

**검증:**
- ✅ MATCH_FAIL Reducer에서 life 차감
- ✅ life: state.life - 1
- ✅ Issue #39에서 이미 구현 완료

---

### AC 2: life가 0이 되면 status가 'GAME_OVER'로 변경되는가?

**✅ 통과**

**파일 위치**: `frontend/src/App.tsx`

**게임 오버 판정 useEffect**:
```typescript
/**
 * 게임 오버 판정 로직
 * life가 0이 되면 자동으로 GAME_OVER 액션을 디스패치합니다.
 */
useEffect(() => {
  // life가 0이고 상태가 PLAYING일 때만 실행
  if (state.life === 0 && state.status === 'PLAYING') {
    console.log('[Game Over] Life is 0, game over!')
    dispatch({ type: 'GAME_OVER' })
  }
}, [state.life, state.status, dispatch])
```

**GameContext의 GAME_OVER Reducer**:
```typescript
case 'GAME_OVER':
  // 게임 오버: status를 'GAME_OVER'로 변경
  return {
    ...state,
    status: 'GAME_OVER',  // ✅ status 변경
  }
```

**동작 흐름:**
```
매칭 실패 (3번째)
  ↓
MATCH_FAIL 디스패치
  ↓
life = 3 - 1 = 2
  ↓
매칭 실패 (4번째)
  ↓
MATCH_FAIL 디스패치
  ↓
life = 2 - 1 = 1
  ↓
매칭 실패 (5번째)
  ↓
MATCH_FAIL 디스패치
  ↓
life = 1 - 1 = 0  // ✅ life가 0이 됨
  ↓
React 리렌더링
  ↓
useEffect 실행 (life === 0 && status === 'PLAYING')
  ↓
GAME_OVER 디스패치
  ↓
Reducer 실행
  ↓
status = 'GAME_OVER'  // ✅ 상태 변경
  ↓
React 리렌더링
  ↓
✅ 게임 오버 상태
```

**Why status === 'PLAYING' 조건?**
- 중복 실행 방지
- 이미 GAME_OVER 상태이면 다시 디스패치하지 않음
- 명확한 의도 표현

**검증:**
- ✅ useEffect로 life === 0 감지
- ✅ state.status === 'PLAYING' 조건 추가
- ✅ GAME_OVER 액션 디스패치
- ✅ Reducer에서 status를 'GAME_OVER'로 변경
- ✅ 의존성 배열 정확히 설정 ([state.life, state.status, dispatch])

---

### AC 3: 게임 오버 상태에서 카드 클릭이 차단되는가?

**✅ 통과**

**handleCardClick의 Guard Clause 5**:
```typescript
// Guard Clause 5: 게임 오버 상태일 때는 클릭 무시
if (state.status === 'GAME_OVER') {
  console.log('[Card Click] Ignored: Game is over')
  return  // ✅ 조기 종료
}
```

**동작 흐름:**
```
life === 0
  ↓
GAME_OVER 디스패치
  ↓
status = 'GAME_OVER'
  ↓
사용자가 카드 클릭 시도
  ↓
handleCardClick(cardId) 호출
  ↓
Guard Clause 5: status === 'GAME_OVER'
  ↓
console.log('[Card Click] Ignored: Game is over')
  ↓
return (조기 종료)
  ↓
✅ FLIP_CARD 액션이 디스패치되지 않음
  ↓
✅ 카드가 뒤집히지 않음
```

**모든 Guard Clause 목록:**
1. 이미 Solved 카드 클릭 무시
2. 이미 Flipped 카드 클릭 무시
3. flippedCards가 2개일 때 클릭 무시
4. 매칭 판별 중일 때 클릭 무시
5. **게임 오버 상태일 때 클릭 무시** (✅ 추가)

**검증:**
- ✅ Guard Clause 5 추가
- ✅ status === 'GAME_OVER' 체크
- ✅ 조기 종료 (return)
- ✅ 카드 클릭 차단
- ✅ 명확한 로그 메시지

---

### AC 4: Header에 life가 정확히 표시되는가?

**✅ 통과 (Issue #32에서 이미 구현됨)**

**Header 컴포넌트** (`src/components/Header.tsx`):
```typescript
interface HeaderProps {
  life: number  // ✅ Props로 life 받음
}

export const Header: React.FC<HeaderProps> = ({ life }) => {
  return (
    <HeaderContainer>
      <LifeDisplay>
        Life: {life}/3  {/* ✅ life 표시 */}
      </LifeDisplay>
    </HeaderContainer>
  )
}
```

**App.tsx에서 Header 사용**:
```typescript
<Header life={state.life} />  {/* ✅ Context에서 life 전달 */}
```

**동작 흐름:**
```
MATCH_FAIL 디스패치
  ↓
Reducer: life = state.life - 1
  ↓
Context 업데이트
  ↓
React 리렌더링
  ↓
Game 컴포넌트 리렌더링
  ↓
<Header life={state.life} />
  ↓
Header 컴포넌트 리렌더링
  ↓
✅ 업데이트된 life 표시
```

**예시:**
```
초기 상태: Life: 3/3
매칭 실패 1번: Life: 2/3  // ✅ 실시간 업데이트
매칭 실패 2번: Life: 1/3  // ✅ 실시간 업데이트
매칭 실패 3번: Life: 0/3  // ✅ 실시간 업데이트
```

**검증:**
- ✅ Header 컴포넌트에서 life Props 받음
- ✅ App.tsx에서 state.life 전달
- ✅ life 값이 실시간으로 업데이트됨
- ✅ Issue #32에서 이미 구현 완료

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
**결과**: ✅ 성공 (390ms)
```
✓ 100 modules transformed.
dist/index.html                   0.46 kB
dist/assets/index-DQ3P1g1z.css    0.91 kB
dist/assets/index-Bs4eVpvo.js   272.26 kB
✓ built in 390ms
```

### 3. 코드 검증
- ✅ App.tsx 수정 완료 (Guard Clause 5, useEffect)
- ✅ 타입 안전성 확보
- ✅ 명확한 로그 메시지

---

## 📂 수정된 파일

### 수정
1. ✅ `frontend/src/App.tsx` (주요 변경)
   - Guard Clause 5 추가 (status === 'GAME_OVER' 체크)
   - 게임 오버 판정 useEffect 추가
   - life === 0 && status === 'PLAYING' 조건

**주요 구성 요소:**
- Guard Clause 5: status === 'GAME_OVER' 체크
- useEffect: life === 0 감지
- GAME_OVER 디스패치

---

## 🎓 소프트웨어 공학적 가치

### 1. 상태 기반 UI 제어

**정의:**
UI의 동작을 상태(state)에 따라 제어하는 패턴입니다.

**구현:**
```typescript
// 상태에 따라 카드 클릭 차단
if (state.status === 'GAME_OVER') {
  return  // 클릭 무시
}
```

**장점:**
- 일관성: 상태가 변하면 UI도 자동으로 변함
- 예측 가능성: 상태만 보면 UI 동작을 알 수 있음
- 디버깅 용이: 상태 로그만으로 문제 파악 가능
- 테스트 용이: 상태만 변경하면 UI 동작 테스트 가능

**React의 핵심 철학:**
```
UI = f(state)
```

---

### 2. Guard Clause 패턴의 확장

**Guard Clause 진화:**
```
Issue #38: Guard Clause 1-3 (카드 상태 체크)
  ↓
Issue #39: Guard Clause 4 (매칭 판별 중 체크)
  ↓
Issue #40: Guard Clause 5 (게임 오버 체크)
```

**5개의 Guard Clause:**
1. isSolved === true
2. isFlipped === true
3. flippedCards.length >= 2
4. isMatching === true
5. **status === 'GAME_OVER'** (✅ 추가)

**장점:**
- 점진적 개선: 단계적으로 엣지 케이스 추가
- 확장 가능: 새로운 조건을 쉽게 추가 가능
- 유지보수: 각 조건이 독립적

---

### 3. useEffect의 조건부 실행

**구현:**
```typescript
useEffect(() => {
  if (state.life === 0 && state.status === 'PLAYING') {
    dispatch({ type: 'GAME_OVER' })
  }
}, [state.life, state.status, dispatch])
```

**Why 두 조건 모두 필요?**

**life === 0만 체크하면?**
```typescript
// ❌ 문제가 있는 코드
useEffect(() => {
  if (state.life === 0) {
    dispatch({ type: 'GAME_OVER' })  // 여러 번 실행될 수 있음
  }
}, [state.life, dispatch])
```

**문제:**
- 이미 GAME_OVER 상태인데 다시 디스패치
- 불필요한 렌더링

**status === 'PLAYING' 추가:**
```typescript
// ✅ 올바른 코드
if (state.life === 0 && state.status === 'PLAYING') {
  // 정확히 한 번만 실행됨
}
```

**장점:**
- 중복 실행 방지
- 명확한 의도 표현
- 성능 최적화

---

### 4. 게임 규칙의 명확한 구현

**게임 규칙:**
1. 초기 생명: 3
2. 매칭 실패 시 생명 -1
3. 생명이 0이 되면 게임 오버
4. 게임 오버 시 카드 클릭 불가

**코드로 명확히 표현:**
```typescript
// 규칙 1: 초기 생명
const initialState = { life: 3 }

// 규칙 2: 매칭 실패 시 생명 -1
case 'MATCH_FAIL':
  return { ...state, life: state.life - 1 }

// 규칙 3: 생명이 0이 되면 게임 오버
if (state.life === 0 && state.status === 'PLAYING') {
  dispatch({ type: 'GAME_OVER' })
}

// 규칙 4: 게임 오버 시 카드 클릭 불가
if (state.status === 'GAME_OVER') {
  return
}
```

**장점:**
- 게임 규칙이 코드에 명확히 반영됨
- 유지보수자가 규칙을 쉽게 이해 가능
- 규칙 변경 시 수정 지점이 명확함

---

## 🔄 데이터 흐름

### 게임 오버 흐름

```
매칭 실패 (life = 1)
  ↓
MATCH_FAIL 디스패치
  ↓
Reducer: life = 1 - 1 = 0
  ↓
Context 업데이트
  ↓
React 리렌더링
  ↓
Header: Life: 0/3 표시
  ↓
useEffect 실행 (life === 0 && status === 'PLAYING')
  ↓
GAME_OVER 디스패치
  ↓
Reducer: status = 'GAME_OVER'
  ↓
Context 업데이트
  ↓
React 리렌더링
  ↓
사용자가 카드 클릭 시도
  ↓
handleCardClick 호출
  ↓
Guard Clause 5: status === 'GAME_OVER'
  ↓
return (조기 종료)
  ↓
✅ 카드 클릭 차단
```

---

## 📊 상태 전환 다이어그램

```
IDLE (초기)
  ↓
INIT_GAME (API 호출)
  ↓
PLAYING (게임 진행, life = 3)
  ↓
MATCH_FAIL (매칭 실패, life = 2)
  ↓
MATCH_FAIL (매칭 실패, life = 1)
  ↓
MATCH_FAIL (매칭 실패, life = 0)
  ↓
GAME_OVER (게임 종료)
  ↓
✅ 카드 클릭 차단
```

---

## 🎯 시나리오별 검증

### 시나리오 1: 정상적인 게임 오버

```
1. 게임 시작 (life = 3)
2. 매칭 실패 (life = 2)
3. 매칭 실패 (life = 1)
4. 매칭 실패 (life = 0)
   ↓
5. useEffect 실행
   ↓
6. GAME_OVER 디스패치
   ↓
7. status = 'GAME_OVER'
   ↓
8. 카드 클릭 차단
```

**결과**: ✅ 정상 동작

---

### 시나리오 2: 게임 오버 후 카드 클릭 시도

```
1. status = 'GAME_OVER'
2. 사용자가 카드 클릭
   ↓
3. handleCardClick 호출
   ↓
4. Guard Clause 5: status === 'GAME_OVER'
   ↓
5. return (조기 종료)
   ↓
6. 카드가 뒤집히지 않음
```

**결과**: ✅ 정상 동작

---

### 시나리오 3: life === 0이지만 status !== 'PLAYING'

```
1. status = 'GAME_OVER', life = 0
2. useEffect 실행
   ↓
3. state.life === 0 && state.status === 'PLAYING'
   ↓
4. 조건 불만족 (status === 'GAME_OVER')
   ↓
5. GAME_OVER 디스패치 안 됨
```

**결과**: ✅ 중복 실행 방지

---

## 🚀 다음 단계 준비

**Issue #41**: [Phase 5] 승리 조건 판정 로직
- useEffect로 모든 카드의 isSolved 체크
- 모든 카드가 Solved이면 VICTORY 디스패치
- status가 'VICTORY'로 변경
- 승리 상태에서 카드 클릭 차단 (Guard Clause 추가)

**Phase 6**: 인터랙션 및 애니메이션
- 카드 3D Flip 애니메이션
- 광클 방지 로직
- 이미지 Preload

**Phase 7**: 모달 및 재시작
- ResultModal 컴포넌트
- 게임 재시작 로직

---

## ⚠️  참고 사항

### Life 차감은 Issue #39에서 이미 구현됨
MATCH_FAIL Reducer에서 `life: state.life - 1`로 이미 구현되어 있습니다.
Issue #40에서는 게임 오버 판정 로직만 추가했습니다.

### Header에 life 표시는 Issue #32에서 이미 구현됨
Header 컴포넌트에서 life Props를 받아 표시하는 기능은 이미 구현되어 있습니다.
Context에서 state.life를 전달하여 실시간으로 업데이트됩니다.

### useEffect의 조건
`state.life === 0 && state.status === 'PLAYING'` 두 조건 모두 필요합니다.
- life === 0만 체크하면 중복 실행 가능
- status === 'PLAYING' 추가로 정확히 한 번만 실행

### 디버깅 로그
개발 환경에서 게임 오버 과정을 추적할 수 있도록 로그를 추가했습니다.
```typescript
console.log('[Game Over] Life is 0, game over!')
console.log('[Card Click] Ignored: Game is over')
```

---

## ✅ 결론

**모든 Acceptance Criteria 통과 ✅**

1. ✅ 매칭 실패 시 life 1 감소 (Issue #39에서 이미 구현)
2. ✅ life === 0일 때 status를 'GAME_OVER'로 변경
3. ✅ 게임 오버 상태에서 카드 클릭 차단
4. ✅ Header에 life 정확히 표시 (Issue #32에서 이미 구현)
5. ✅ TypeScript 컴파일 및 빌드 성공
6. ✅ 타입 안전성 확보
7. ✅ 명확한 로그 메시지

**소프트웨어 공학 원칙 준수:**
- 상태 기반 UI 제어 (일관성, 예측 가능성)
- Guard Clause 패턴 확장 (점진적 개선)
- useEffect 조건부 실행 (중복 방지)
- 게임 규칙의 명확한 구현 (코드로 표현)
- React의 선언적 프로그래밍 (UI = f(state))

**Phase 5 (4/5) 완료! 🎉**
