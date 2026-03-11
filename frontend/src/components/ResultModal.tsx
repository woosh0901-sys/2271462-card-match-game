import type { FC } from 'react'
import styled, { keyframes } from 'styled-components'
import type { DifficultyStats } from '../hooks/useStatistics'

/**
 * ResultModal Props Interface
 */
interface ResultModalProps {
  isOpen: boolean
  result: 'GAME_OVER' | 'VICTORY'
  onRestart: () => void
  /** 최종 점수 */
  score: number
  /** 로컬에 저장된 이번 판 포함한 통계 객체 */
  stats: DifficultyStats
  /** 최대 콤보 */
  maxCombo: number
  /** 경과 시간 (초) */
  elapsedTime: number
  /** 이번 게임에 최고 기록 갱신 여부 */
  isNewBest: boolean
}

// ─── 애니메이션 ────────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

const slideUp = keyframes`
  from { transform: translateY(40px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
`

const shimmer = keyframes`
  0%, 100% { text-shadow: 0 0 10px gold, 0 0 20px gold; }
  50%       { text-shadow: 0 0 20px gold, 0 0 40px gold, 0 0 60px gold; }
`

// ─── Styled Components ─────────────────────────────────────────────────────────

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: ${({ theme }) => theme.colors.overlay};
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
  animation: ${fadeIn} 0.3s ease;
`

const ModalContent = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 20px;
  padding: ${({ theme }) => theme.spacing.xxl};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 380px;
  animation: ${slideUp} 0.35s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 480px) {
    min-width: 90vw;
    padding: ${({ theme }) => theme.spacing.xl};
  }
`

const ModalEmoji = styled.div`
  font-size: 72px;
  line-height: 1;
  user-select: none;
`

const ModalTitle = styled.h2<{ $result: 'GAME_OVER' | 'VICTORY' }>`
  font-size: 2.2rem;
  font-weight: 900;
  color: ${({ $result }) => ($result === 'VICTORY' ? '#ffd700' : '#ff6b6b')};
  margin: 0;
  text-align: center;
  animation: ${({ $result }) => ($result === 'VICTORY' ? shimmer : 'none')} 2s ease-in-out infinite;
`

const ModalMessage = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  text-align: center;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  margin: 4px 0;
`

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 12px 16px;
  text-align: center;
`

const StatCardLabel = styled.div`
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`

const StatCardValue = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
`

const NewBestBadge = styled.div`
  background: linear-gradient(135deg, #f6d365, #fda085);
  color: white;
  font-weight: 800;
  font-size: 0.9rem;
  padding: 6px 18px;
  border-radius: 20px;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(253, 160, 133, 0.5);
`

const RestartButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.primaryHover});
  color: white;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  margin-top: 8px;
  width: 100%;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`

// ─── 시간 포맷 ────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * ResultModal Component
 * 게임 결과(승리/패배)를 표시하는 모달
 * PRD: 성공 메시지, 실패 메시지, 재시작 버튼
 * 추가: 점수, 최고기록, 최대콤보, 소요시간 통계 표시
 */
export const ResultModal: FC<ResultModalProps> = ({
  isOpen,
  result,
  onRestart,
  score,
  stats,
  maxCombo,
  elapsedTime,
  isNewBest,
}) => {
  const emoji = result === 'VICTORY' ? '🎉' : '😢'
  const title = result === 'VICTORY' ? '🏆 승리!' : '게임 오버'
  // PRD 6 UI/UX 카피라이팅
  const message =
    result === 'VICTORY'
      ? '축하합니다! 모든 짝을 찾았습니다!'
      : '아쉽네요. 다시 도전해보세요!'

  return (
    <ModalOverlay $isOpen={isOpen} data-testid="result-modal">
      <ModalContent>
        <ModalEmoji>{emoji}</ModalEmoji>
        <ModalTitle $result={result} data-testid="modal-title">
          {title}
        </ModalTitle>
        <ModalMessage>{message}</ModalMessage>

        {isNewBest && result === 'VICTORY' && (
          <NewBestBadge>✨ 신기록 달성!</NewBestBadge>
        )}

        {/* 게임 통계 */}
        <StatsGrid>
          <StatCard>
            <StatCardLabel>현재 점수</StatCardLabel>
            <StatCardValue>{score.toLocaleString()}</StatCardValue>
          </StatCard>
          <StatCard>
            <StatCardLabel>최고 기록</StatCardLabel>
            <StatCardValue>{stats.bestScore.toLocaleString()}</StatCardValue>
          </StatCard>
          <StatCard>
            <StatCardLabel>현재 연속 승리</StatCardLabel>
            <StatCardValue>{stats.currentStreak}연승</StatCardValue>
          </StatCard>
          <StatCard>
            <StatCardLabel>최대 연속 승리</StatCardLabel>
            <StatCardValue>{stats.maxStreak}연승</StatCardValue>
          </StatCard>
          <StatCard>
            <StatCardLabel>최대 콤보</StatCardLabel>
            <StatCardValue>×{maxCombo}</StatCardValue>
          </StatCard>
          <StatCard>
            <StatCardLabel>소요 시간</StatCardLabel>
            <StatCardValue>{formatTime(elapsedTime)}</StatCardValue>
          </StatCard>
        </StatsGrid>

        <RestartButton onClick={onRestart} data-testid="restart-button">
          게임 재시작
        </RestartButton>
      </ModalContent>
    </ModalOverlay>
  )
}

export default ResultModal
