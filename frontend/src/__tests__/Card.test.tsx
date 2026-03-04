import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'
import { Card } from '../components/Card'
import { theme } from '../styles/theme'
import type { Card as CardType } from '../types/Card'

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────
const makeCard = (overrides: Partial<CardType> = {}): CardType => ({
  id: 'c1',
  type: 'apple',
  imgUrl: '/images/apple.png',
  isFlipped: false,
  isSolved: false,
  ...overrides,
})

const renderCard = (cardData: CardType, onClick = vi.fn()) => {
  const result = render(
    <ThemeProvider theme={theme}>
      <Card cardData={cardData} onClick={onClick} />
    </ThemeProvider>
  )
  return result
}

// ─── 뒷면 상태 ────────────────────────────────────────────────────────────────
// 주의: jsdom은 CSS 3D transform (backface-visibility: hidden)을 지원하지 않음.
// 카드 뒤집기는 CSS rotateY 애니메이션으로 구현되어 있어 시각적 상태 검증 불가.
// 대신 컴포넌트가 올바르게 렌더링되는지, emoji가 DOM에 포함되는지 검증한다.
describe('Card (isFlipped: false)', () => {
  it('컴포넌트가 오류 없이 렌더링된다', () => {
    const { container } = renderCard(makeCard({ isFlipped: false }))
    // CardContainer (최상위 div)가 존재해야 함
    expect(container.firstChild).toBeInTheDocument()
  })

  it('emoji가 DOM에 존재한다 (CSS transform으로 시각적 숨김 처리됨)', () => {
    renderCard(makeCard({ isFlipped: false }))
    // emoji는 항상 DOM에 렌더링되어 있으나,
    // CSS backface-visibility:hidden + rotateY(0deg)로 시각적으로 뒤를 향함
    expect(screen.getByText('🍎')).toBeInTheDocument()
  })
})

// ─── 앞면 상태 ────────────────────────────────────────────────────────────────
describe('Card (isFlipped: true)', () => {
  it('과일 emoji가 표시된다', () => {
    renderCard(makeCard({ isFlipped: true }))
    expect(screen.getByText('🍎')).toBeInTheDocument()
  })
})

// ─── 짝 맞춤 상태 ─────────────────────────────────────────────────────────────
describe('Card (isSolved: true)', () => {
  it('과일 emoji가 표시된다', () => {
    renderCard(makeCard({ isSolved: true }))
    expect(screen.getByText('🍎')).toBeInTheDocument()
  })
})

// ─── 클릭 이벤트 ──────────────────────────────────────────────────────────────
describe('Card click', () => {
  it('클릭 시 onClick 핸들러가 정확히 1회 호출된다', async () => {
    const handleClick = vi.fn()
    const { container } = renderCard(makeCard(), handleClick)

    // container.firstChild = CardContainer (클릭 이벤트가 등록된 div)
    await userEvent.click(container.firstChild as Element)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
