import type { FC } from 'react'
import styled from 'styled-components'

/**
 * Header Props Interface
 */
interface HeaderProps {
  /** 남은 생명(기회) 수 */
  life: number
  /** 현재 점수 */
  score: number
  /** 현재 콤보 */
  combo: number
  /** 경과 시간 (초) */
  elapsedTime: number
  /** 힌트 사용 여부 */
  hintUsed: boolean
  /** 힌트 버튼 클릭 핸들러 */
  onHint: () => void
  /** 게임 플레이 중 여부 */
  isPlaying: boolean
}

// ─── Styled Components ─────────────────────────────────────────────────────────

const HeaderContainer = styled.header`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primaryHover};
  flex-wrap: wrap;
  gap: 8px;
`

const StatGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`

const StatLabel = styled.span`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.5px;
  text-transform: uppercase;
`

const StatValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1;
`

const ComboValue = styled(StatValue) <{ $active: boolean }>`
  color: ${({ $active }) => ($active ? '#ffd700' : 'rgba(255, 255, 255, 0.5)')};
  text-shadow: ${({ $active }) => ($active ? '0 0 8px rgba(255,215,0,0.8)' : 'none')};
`

const HintButton = styled.button<{ $used: boolean }>`
  background: ${({ $used }) => ($used ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.25)')};
  border: 2px solid ${({ $used }) => ($used ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)')};
  color: ${({ $used }) => ($used ? 'rgba(255,255,255,0.3)' : 'white')};
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: ${({ $used }) => ($used ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.35);
    transform: translateY(-1px);
  }
`

// ─── 시간 포맷 헬퍼 ────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Header Component
 * 타이머, 점수, 콤보, 생명, 힌트 버튼을 표시합니다.
 * PRD 6 UI/UX: 상단 정보 영역
 */
export const Header: FC<HeaderProps> = ({
  life,
  score,
  combo,
  elapsedTime,
  hintUsed,
  onHint,
  isPlaying,
}) => {
  const lifeIcons = Array.from({ length: 3 }, (_, i) => (i < life ? '❤️' : '🖤'))

  return (
    <HeaderContainer>
      {/* 타이머 */}
      <StatGroup>
        <StatLabel>시간</StatLabel>
        <StatValue data-testid="timer-display">⏱ {formatTime(elapsedTime)}</StatValue>
      </StatGroup>

      {/* 점수 */}
      <StatGroup>
        <StatLabel>점수</StatLabel>
        <StatValue data-testid="score-display">
          {score.toLocaleString()}
        </StatValue>
      </StatGroup>

      {/* 콤보 */}
      <StatGroup>
        <StatLabel>콤보</StatLabel>
        <ComboValue $active={combo >= 2} data-testid="combo-display">
          {combo >= 2 ? `🔥×${combo}` : combo > 0 ? `×${combo}` : '—'}
        </ComboValue>
      </StatGroup>

      {/* 남은 기회 — PRD: "남은 기회: 3/3" */}
      <StatGroup>
        <StatLabel>남은 기회</StatLabel>
        <StatValue data-testid="life-display">{lifeIcons.join(' ')}</StatValue>
      </StatGroup>

      {/* 힌트 버튼 */}
      <HintButton
        $used={hintUsed || !isPlaying}
        onClick={onHint}
        disabled={hintUsed || !isPlaying}
        data-testid="hint-button"
        title="힌트: 1.5초간 카드 공개 (Life 1 소모)"
      >
        {hintUsed ? '💡 사용됨' : '💡 힌트 (-1❤️)'}
      </HintButton>
    </HeaderContainer>
  )
}

export default Header
