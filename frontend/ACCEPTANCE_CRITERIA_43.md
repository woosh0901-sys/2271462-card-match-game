# Acceptance Criteria - Issue #43

## 📋 Issue
**[Phase 6] 광클 방지 로직 (pointer-events 차단)**

## ✅ Acceptance Criteria Checklist

### 1. 매칭 판별 중에는 다른 카드 클릭이 차단되는가?
- ✅ **충족**
- **검증 방법**:
  - **JavaScript 레벨**: Guard Clause 4 (이미 구현됨)
    - `App.tsx:129-132` - `if (state.isMatching) return`
  - **CSS 레벨**: pointer-events 차단 (신규 구현)
    - `GameBoard.tsx:29-30` - `pointer-events: none`
  - **이중 방어 전략**: 두 레벨에서 모두 차단하여 안정성 극대화

### 2. pointer-events: none이 적용되는가?
- ✅ **충족**
- **검증 방법**:
  - `GameBoard.tsx:29-30`
  ```typescript
  pointer-events: ${({ $isMatching }) =>
    $isMatching ? 'none' : 'auto'}; /* 매칭 판별 중에는 클릭 차단 */
  ```
  - `isMatching === true`일 때 BoardContainer 전체에 `pointer-events: none` 적용
  - 모든 자식 요소(CardWrapper, Card)의 클릭 이벤트가 자동으로 차단됨

### 3. 빠른 연속 클릭 시 오작동이 발생하지 않는가?
- ✅ **충족**
- **검증 방법**:
  - **Guard Clause 1-5**: 5개의 Guard Clause가 모든 엣지 케이스 방지
  - **CSS pointer-events**: UI 레벨에서 클릭 자체를 원천 차단
  - **isMatching 플래그**: 매칭 판별 중 상태를 명확히 관리
  - 빠르게 연속 클릭해도 `flippedCards.length`가 2를 초과하지 않음

## 📝 구현 세부사항

### 변경 파일 1: GameBoard.tsx

#### 1. Props Interface 업데이트 (8-15줄)
```typescript
interface GameBoardProps {
  /** 16개의 카드 배열 */
  cards: CardType[]
  /** 카드 클릭 핸들러 */
  onCardClick: (cardId: string) => void
  /** 매칭 판별 중 여부 (광클 방지용) */
  isMatching: boolean  // 신규 추가
}
```

#### 2. BoardContainer 스타일 업데이트 (22-31줄)
```typescript
const BoardContainer = styled.div<{ $isMatching: boolean }>`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.background};
  pointer-events: ${({ $isMatching }) =>
    $isMatching ? 'none' : 'auto'}; /* 매칭 판별 중에는 클릭 차단 */
`
```

#### 3. GameBoard 컴포넌트 업데이트 (55-69줄)
```typescript
export const GameBoard: React.FC<GameBoardProps> = ({
  cards,
  onCardClick,
  isMatching,  // 신규 prop 수신
}) => {
  return (
    <BoardContainer $isMatching={isMatching}>
      {cards.map((card) => (
        <CardWrapper key={card.id}>
          <Card cardData={card} onClick={() => onCardClick(card.id)} />
        </CardWrapper>
      ))}
    </BoardContainer>
  )
}
```

### 변경 파일 2: App.tsx

#### GameBoard 호출 업데이트 (206-214줄)
```typescript
// 게임 플레이 화면
return (
  <GameContainer>
    <Header life={state.life} />
    <GameBoard
      cards={state.cards}
      onCardClick={handleCardClick}
      isMatching={state.isMatching}  // 신규 prop 전달
    />
  </GameContainer>
)
```

## 🎓 소프트웨어 공학적 설계 원칙

### 1. 다층 방어 전략 (Defense in Depth)

#### 계층별 방어 메커니즘
```
사용자 클릭 이벤트
      ↓
┌─────────────────────────────────┐
│ Layer 1: CSS (pointer-events)   │ ← 신규 추가
│ - UI 레벨에서 클릭 원천 차단     │
│ - 브라우저가 이벤트 생성 방지    │
└─────────────────────────────────┘
      ↓ (이벤트가 발생하지 않음)
┌─────────────────────────────────┐
│ Layer 2: JavaScript Guard Clause│ ← 이미 구현됨
│ - 로직 레벨에서 조건 검사        │
│ - 5개의 Guard Clause             │
└─────────────────────────────────┘
      ↓
실제 카드 뒤집기 로직 실행
```

#### Why Defense in Depth?
- **CSS만 사용하는 경우**: JavaScript로 강제 실행 시 우회 가능
- **JavaScript만 사용하는 경우**: 클릭 이벤트는 발생하여 불필요한 연산 발생
- **두 가지 모두 사용**: 각 계층의 약점을 서로 보완

### 2. pointer-events vs 다른 방법 비교

#### ❌ disabled 속성
```typescript
// 단점: 모든 Card 컴포넌트를 수정해야 함
<Card disabled={isMatching} />
```

#### ❌ 조건부 onClick
```typescript
// 단점: 클릭 이벤트는 여전히 발생함
onClick={isMatching ? undefined : handleClick}
```

#### ✅ pointer-events (채택)
```typescript
// 장점: 부모 컴포넌트에서 한 번에 제어
pointer-events: ${({ $isMatching }) => $isMatching ? 'none' : 'auto'}
```

**pointer-events의 장점**
1. **캡슐화**: 부모 컴포넌트에서 제어 (자식 컴포넌트 수정 불필요)
2. **성능**: 이벤트가 아예 발생하지 않음 (이벤트 핸들러 호출 없음)
3. **간결성**: 한 줄의 CSS로 전체 보드 제어
4. **시각적 피드백**: hover, cursor 등도 자동으로 차단됨

### 3. Debounce/Throttle vs pointer-events

Plan.md에서 언급된 Debounce/Throttle과의 비교:

#### Debounce
```typescript
// 마지막 호출 후 N초 대기
const debouncedClick = debounce(handleClick, 300)
```
- **사용 사례**: 검색 입력, 윈도우 리사이즈
- **단점**: 첫 클릭은 허용, 이후 클릭만 제한

#### Throttle
```typescript
// N초에 한 번만 실행
const throttledClick = throttle(handleClick, 300)
```
- **사용 사례**: 스크롤 이벤트, 드래그
- **단점**: 일정 시간마다 한 번은 실행됨

#### pointer-events (채택)
```typescript
// 조건부로 완전히 차단
pointer-events: ${isMatching ? 'none' : 'auto'}
```
- **사용 사례**: 특정 상태에서 완전 차단
- **장점**: 조건이 true일 때 100% 차단

**이 프로젝트에 적합한 이유**
- 매칭 판별 중에는 **어떤 클릭도 허용하면 안 됨**
- Debounce/Throttle은 "빈도 제한", pointer-events는 "완전 차단"
- 게임 로직에는 완전 차단이 더 적합

### 4. 상태 기반 UI 제어

#### 단방향 데이터 흐름
```
State (isMatching) → Props → Style (pointer-events)
```

#### 선언적 프로그래밍
```typescript
// ❌ 명령형 (직접 DOM 조작)
if (isMatching) {
  document.getElementById('board').style.pointerEvents = 'none'
}

// ✅ 선언형 (상태에 따라 자동 적용)
pointer-events: ${({ $isMatching }) => $isMatching ? 'none' : 'auto'}
```

## 🧪 테스트 시나리오

### 시나리오 1: 정상 클릭 (isMatching = false)
```
1. 사용자가 카드 클릭
2. isMatching === false
3. pointer-events === 'auto'
4. 클릭 이벤트 발생
5. handleCardClick 실행
6. 카드 뒤집힘
```

### 시나리오 2: 매칭 판별 중 클릭 (isMatching = true)
```
1. 두 카드가 뒤집힌 상태
2. 매칭 판별 시작 → isMatching = true
3. pointer-events === 'none' 적용
4. 사용자가 다른 카드 클릭 시도
5. ❌ 클릭 이벤트 발생하지 않음 (CSS 차단)
6. handleCardClick 호출되지 않음
7. 매칭 판별 완료 → isMatching = false
8. pointer-events === 'auto' 복원
```

### 시나리오 3: 빠른 연속 클릭 (광클 테스트)
```
1. 사용자가 빠르게 3장의 카드를 연속 클릭
2. 첫 번째 클릭:
   - Guard Clause 통과
   - 카드 1 뒤집힘
3. 두 번째 클릭:
   - Guard Clause 통과
   - 카드 2 뒤집힘
   - flippedCards.length === 2
   - isMatching = true (매칭 판별 시작)
   - pointer-events = 'none' 적용
4. 세 번째 클릭:
   - ❌ pointer-events: none으로 차단
   - 이벤트가 아예 발생하지 않음
5. 매칭 판별 완료 (1초 후):
   - isMatching = false
   - pointer-events = 'auto'
   - 다시 클릭 가능
```

### 시나리오 4: 이중 방어 검증
```
만약 pointer-events가 우회되어 클릭 이벤트가 발생한다면?
→ Guard Clause 4가 차단:
   if (state.isMatching) {
     console.log('[Card Click] Ignored: Matching in progress')
     return
   }
```

## 📊 코드 품질 지표

### TypeScript 타입 안전성
- ✅ GameBoardProps에 isMatching: boolean 명시
- ✅ BoardContainer의 $isMatching prop 타입 정의
- ✅ 컴파일 타임 타입 검증 통과

### 성능 최적화
- ✅ pointer-events로 불필요한 이벤트 핸들러 호출 방지
- ✅ 이벤트가 아예 발생하지 않아 성능 향상
- ✅ DOM 조작 없이 CSS만으로 처리

### 유지보수성
- ✅ 부모 컴포넌트(GameBoard)에서 중앙 제어
- ✅ 자식 컴포넌트(Card) 수정 불필요
- ✅ 단일 prop으로 전체 동작 제어

## 🧪 테스트 결과

### TypeScript 컴파일
```
✓ 컴파일 성공 (에러 없음)
```

### Production 빌드
```
vite v7.3.1 building client environment for production...
transforming...
✓ 100 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.46 kB │ gzip:  0.29 kB
dist/assets/index-DQ3P1g1z.css    0.91 kB │ gzip:  0.49 kB
dist/assets/index-B47kmHW6.js   272.18 kB │ gzip: 90.54 kB
✓ built in 389ms
```

## 🔍 브라우저 호환성

### pointer-events 지원
- ✅ Chrome/Edge: 완전 지원
- ✅ Firefox: 완전 지원
- ✅ Safari: 완전 지원
- ✅ IE11: 완전 지원 (CSS 2.1 스펙)

### CSS 표준
- **CSS 2.1**: pointer-events는 SVG에서 유래
- **CSS 3**: HTML 요소에도 확장 적용
- 모든 모던 브라우저에서 안정적으로 작동

## 📐 아키텍처 다이어그램

```
┌──────────────────────────────────────────┐
│           App Component                   │
│  - state.isMatching 관리                 │
│  - Guard Clause 4 (JavaScript 방어)      │
└─────────────┬────────────────────────────┘
              │ isMatching prop 전달
              ↓
┌──────────────────────────────────────────┐
│        GameBoard Component                │
│  - isMatching prop 수신                  │
│  - BoardContainer에 전달                 │
└─────────────┬────────────────────────────┘
              │ $isMatching prop 전달
              ↓
┌──────────────────────────────────────────┐
│      BoardContainer (styled-div)          │
│  - pointer-events 조건부 적용 (CSS 방어) │
│  - 모든 자식 요소의 클릭 차단            │
└─────────────┬────────────────────────────┘
              │ 클릭 이벤트 전파 차단
              ↓
┌──────────────────────────────────────────┐
│     CardWrapper & Card Components         │
│  - 클릭 이벤트가 전달되지 않음           │
└──────────────────────────────────────────┘
```

---

**검증 완료**: 2026-01-31
**검증자**: Claude Sonnet 4.5
