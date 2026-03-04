# Acceptance Criteria - Issue #45

## 📋 Issue
**[Phase 7] ResultModal 컴포넌트 및 재시작 버튼 구현**

## ✅ Acceptance Criteria Checklist

### 1. ResultModal 컴포넌트가 생성되었는가?
- ✅ **충족**
- **검증 방법**:
  - `components/ResultModal.tsx` 파일 생성
  - Props 인터페이스 정의 (isOpen, result, onRestart)
  - TypeScript로 타입 안전성 보장
  ```typescript
  interface ResultModalProps {
    isOpen: boolean
    result: 'GAME_OVER' | 'VICTORY'
    onRestart: () => void
  }
  ```

### 2. 모달이 화면 중앙에 배치되는가?
- ✅ **충족**
- **검증 방법**:
  - `ModalOverlay` - fixed positioning, flex layout
  ```typescript
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  ```
  - 화면 전체를 덮고 중앙 정렬로 콘텐츠 배치

### 3. 배경이 반투명한가?
- ✅ **충족**
- **검증 방법**:
  - `ModalOverlay` - theme.colors.overlay 사용
  ```typescript
  background-color: ${({ theme }) => theme.colors.overlay};
  // theme.colors.overlay = 'rgba(0, 0, 0, 0.7)'
  ```
  - 70% 불투명도의 검은색 배경

### 4. result에 따라 다른 메시지가 표시되는가?
- ✅ **충족**
- **검증 방법**:
  - **VICTORY**:
    - Emoji: 🎉
    - Title: "승리!" (녹색)
    - Message: "축하합니다! 모든 짝을 찾았습니다!"
  - **GAME_OVER**:
    - Emoji: 😢
    - Title: "게임 오버" (빨간색)
    - Message: "아쉽네요. 다시 도전해보세요!"
  ```typescript
  const emoji = result === 'VICTORY' ? '🎉' : '😢'
  const title = result === 'VICTORY' ? '승리!' : '게임 오버'
  const message = result === 'VICTORY'
    ? '축하합니다! 모든 짝을 찾았습니다!'
    : '아쉽네요. 다시 도전해보세요!'
  ```

### 5. "게임 재시작" 버튼을 클릭하면 onRestart가 호출되는가?
- ✅ **충족**
- **검증 방법**:
  - `RestartButton` - onClick={onRestart}
  ```typescript
  <RestartButton onClick={onRestart}>게임 재시작</RestartButton>
  ```
  - 버튼 클릭 시 props로 전달받은 onRestart 함수 호출

## 📝 구현 세부사항

### ResultModal.tsx 컴포넌트 구조

#### 1. Props 인터페이스 (5-13줄)
```typescript
interface ResultModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean
  /** 게임 결과 (GAME_OVER | VICTORY) */
  result: 'GAME_OVER' | 'VICTORY'
  /** 게임 재시작 핸들러 */
  onRestart: () => void
}
```

#### 2. ModalOverlay (15-41줄)
```typescript
const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: ${({ theme }) => theme.colors.overlay};
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: ${({ theme }) => theme.zIndex.modal}; /* 100 */
  animation: fadeIn ${({ theme }) => theme.transitions.normal};

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`
```
- **역할**: 화면 전체를 덮는 반투명 배경
- **애니메이션**: fadeIn (0.3s)
- **조건부 표시**: $isOpen에 따라 display 제어

#### 3. ModalContent (43-73줄)
```typescript
const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.cardFront};
  border-radius: ${({ theme }) => theme.borderRadius.xl}; /* 16px */
  padding: ${({ theme }) => theme.spacing.xxl}; /* 48px */
  box-shadow: ${({ theme }) => theme.shadows.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg}; /* 24px */
  min-width: 400px;
  animation: slideUp ${({ theme }) => theme.transitions.normal};

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    min-width: 90%;
    padding: ${({ theme }) => theme.spacing.xl};
  }
`
```
- **역할**: 모달의 실제 내용 컨테이너
- **애니메이션**: slideUp (아래에서 위로)
- **반응형**: 모바일에서 90% 너비

#### 4. ModalEmoji (75-81줄)
```typescript
const ModalEmoji = styled.div`
  font-size: 72px;
  line-height: 1;
  user-select: none;
`
```
- **역할**: 결과에 따른 큰 emoji 표시
- **크기**: 72px (눈에 띄는 크기)

#### 5. ModalTitle (83-92줄)
```typescript
const ModalTitle = styled.h2<{ $result: 'GAME_OVER' | 'VICTORY' }>`
  font-size: ${({ theme }) => theme.fontSizes.xxxl}; /* 32px */
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme, $result }) =>
    $result === 'VICTORY' ? theme.colors.success : theme.colors.danger};
  margin: 0;
  text-align: center;
`
```
- **역할**: 모달 제목
- **조건부 색상**:
  - VICTORY: theme.colors.success (#27ae60 - 녹색)
  - GAME_OVER: theme.colors.danger (#e74c3c - 빨간색)

#### 6. ModalMessage (94-102줄)
```typescript
const ModalMessage = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg}; /* 18px */
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  text-align: center;
  line-height: 1.6;
`
```
- **역할**: 결과 메시지
- **색상**: textSecondary (회색)

#### 7. RestartButton (104-130줄)
```typescript
const RestartButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-top: ${({ theme }) => theme.spacing.md};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  &:active {
    transform: translateY(0);
  }
`
```
- **역할**: 게임 재시작 버튼
- **인터랙션**:
  - hover: 색상 변경, 위로 2px 이동, 그림자 증가
  - active: 원래 위치로 복귀

#### 8. ResultModal 컴포넌트 (132-184줄)
```typescript
export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  result,
  onRestart,
}) => {
  const emoji = result === 'VICTORY' ? '🎉' : '😢'
  const title = result === 'VICTORY' ? '승리!' : '게임 오버'
  const message =
    result === 'VICTORY'
      ? '축하합니다! 모든 짝을 찾았습니다!'
      : '아쉽네요. 다시 도전해보세요!'

  return (
    <ModalOverlay $isOpen={isOpen}>
      <ModalContent>
        <ModalEmoji>{emoji}</ModalEmoji>
        <ModalTitle $result={result}>{title}</ModalTitle>
        <ModalMessage>{message}</ModalMessage>
        <RestartButton onClick={onRestart}>게임 재시작</RestartButton>
      </ModalContent>
    </ModalOverlay>
  )
}
```
- **조건부 렌더링**: result에 따라 emoji, title, message 변경
- **이벤트 처리**: RestartButton onClick에 onRestart 연결

## 🎓 소프트웨어 공학적 설계 원칙

### 1. 모달 UI 패턴

#### 모달의 구조
```
ModalOverlay (전체 화면, 반투명)
  └─ ModalContent (실제 내용)
       ├─ ModalEmoji
       ├─ ModalTitle
       ├─ ModalMessage
       └─ RestartButton
```

#### 왜 모달을 사용하는가?
- **주의 집중**: 사용자의 시선을 결과에 집중시킴
- **명확한 종료**: 게임이 끝났음을 명확히 전달
- **다음 액션 유도**: "게임 재시작" 버튼으로 다음 행동 제안

### 2. Portal API vs 일반 렌더링

#### Plan.md에서 언급된 Portal API
```typescript
// Portal 사용 (계획)
ReactDOM.createPortal(
  <ResultModal ... />,
  document.body
)
```

#### 현재 구현 (일반 렌더링)
```typescript
// fixed positioning + z-index로 충분히 동작
<ResultModal isOpen={...} result={...} onRestart={...} />
```

**Portal이 필요한 경우**
- 부모 컴포넌트의 `overflow: hidden`에 영향받는 경우
- 부모의 `z-index` 스택에 갇히는 경우
- 복잡한 컴포넌트 트리에서 모달 위치 제어가 어려운 경우

**현재 구현이 충분한 이유**
- `position: fixed` + `z-index: 100`으로 최상위 배치
- 부모 제약이 없는 단순한 컴포넌트 구조
- 추가 복잡도 없이 요구사항 충족

**향후 Portal 추가 가능**
```typescript
// 필요 시 쉽게 전환 가능
import { createPortal } from 'react-dom'

export const ResultModal: React.FC<ResultModalProps> = (props) => {
  return createPortal(
    <ModalOverlay ...>...</ModalOverlay>,
    document.body
  )
}
```

### 3. 조건부 렌더링 전략

#### display: none vs 조건부 렌더링
```typescript
// ❌ 조건부 렌더링 (비추천)
{isOpen && <ResultModal ... />}
// 매번 컴포넌트 마운트/언마운트 → 애니메이션 어려움

// ✅ display 제어 (채택)
<ModalOverlay $isOpen={isOpen}>
  {/* 항상 렌더링, display로 표시/숨김 */}
</ModalOverlay>
// 애니메이션 (fadeIn, slideUp) 부드럽게 작동
```

### 4. 애니메이션 설계

#### Fade In + Slide Up
```typescript
// ModalOverlay: fadeIn
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

// ModalContent: slideUp
@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

**왜 두 가지 애니메이션?**
- **fadeIn (Overlay)**: 배경이 부드럽게 나타남
- **slideUp (Content)**: 내용이 아래에서 위로 올라오며 등장
- **레이어드 효과**: 깊이감 있는 UX

### 5. 반응형 디자인

#### Desktop vs Mobile
```typescript
// Desktop: 400px 고정 너비
min-width: 400px;

// Mobile: 90% 유동 너비
@media (max-width: 480px) {
  min-width: 90%;
  padding: 32px; // xxl → xl
}
```

### 6. 테마 시스템 활용

#### Design Token 사용
```typescript
// ❌ 하드코딩 (비추천)
background-color: rgba(0, 0, 0, 0.7);
color: #27ae60;

// ✅ 테마 토큰 (권장)
background-color: ${({ theme }) => theme.colors.overlay};
color: ${({ theme }) => theme.colors.success};
```

**장점**
- 중앙 집중식 디자인 관리
- 다크 모드 등 테마 전환 용이
- 일관된 디자인 보장

## 🎨 UI/UX 디자인

### 승리 모달 (VICTORY)
```
┌────────────────────────────────┐
│                                │
│           🎉                   │
│                                │
│         승리!                  │  ← 녹색 (#27ae60)
│                                │
│  축하합니다!                   │
│  모든 짝을 찾았습니다!         │
│                                │
│   [ 게임 재시작 ]              │  ← 파란색 버튼
│                                │
└────────────────────────────────┘
```

### 게임 오버 모달 (GAME_OVER)
```
┌────────────────────────────────┐
│                                │
│           😢                   │
│                                │
│       게임 오버                │  ← 빨간색 (#e74c3c)
│                                │
│  아쉽네요.                     │
│  다시 도전해보세요!            │
│                                │
│   [ 게임 재시작 ]              │  ← 파란색 버튼
│                                │
└────────────────────────────────┘
```

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
dist/assets/index-S3OEk35u.js   272.03 kB │ gzip: 90.43 kB
✓ built in 398ms
```

## 📊 코드 품질 지표

### 타입 안전성
- ✅ Props 인터페이스로 타입 정의
- ✅ result 타입을 Union Type으로 제한
- ✅ styled-components props 타입 정의

### 재사용성
- ✅ Props로 모든 동작 제어 가능
- ✅ 테마 시스템으로 스타일 일관성
- ✅ 독립적인 컴포넌트 (의존성 최소화)

### 접근성
- ✅ 시맨틱 HTML (h2, p, button)
- ✅ 명확한 버튼 텍스트
- ✅ 충분한 색상 대비

### 성능
- ✅ display: none으로 렌더링 최소화
- ✅ CSS 애니메이션 (GPU 가속)
- ✅ 불필요한 리렌더링 없음

## 🔄 향후 개선 사항

### 1. Portal API 적용 (선택사항)
```typescript
import { createPortal } from 'react-dom'

export const ResultModal: React.FC<ResultModalProps> = (props) => {
  return createPortal(
    <ModalOverlay ...>...</ModalOverlay>,
    document.body
  )
}
```

### 2. 애니메이션 개선
- Exit 애니메이션 추가 (fadeOut, slideDown)
- Framer Motion 등 애니메이션 라이브러리 사용

### 3. 추가 정보 표시
- 플레이 시간
- 남은 생명 수
- 점수 (향후 추가 시)

---

**검증 완료**: 2026-01-31
**검증자**: Claude Sonnet 4.5
