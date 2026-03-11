import type { FC } from 'react'
import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import type { Difficulty } from '../types/Card'
import { useBestScore } from '../hooks/useBestScore'
import { ThemeSettingsModal } from './ThemeSettingsModal'
import { StatisticsModal } from './StatisticsModal'

interface DifficultyScreenProps {
  onSelectDifficulty: (difficulty: Difficulty) => void
}

// ─── 애니메이션 ────────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
`

// ─── Styled Components ─────────────────────────────────────────────────────────

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: ${({ theme }) => theme.spacing.xl};
  animation: ${fadeIn} 0.5s ease;
`

const Title = styled.h1`
  font-size: 3rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: white;
  text-align: center;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  margin: 0;
  animation: ${float} 3s ease-in-out infinite;
`

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  margin: 0;
`

const DifficultyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  max-width: 700px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const DifficultyCard = styled.button<{ $color: string; $hoverColor: string }>`
  background: ${({ $color }) => $color};
  border: none;
  border-radius: 16px;
  padding: 32px 20px;
  cursor: pointer;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transition: all 0.25s ease;

  &:hover {
    background: ${({ $hoverColor }) => $hoverColor};
    transform: translateY(-6px);
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(-2px);
  }
`

const DifficultyEmoji = styled.span`
  font-size: 2.5rem;
  line-height: 1;
`

const DifficultyLabel = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 1px;
`

const DifficultyDetail = styled.span`
  font-size: 0.85rem;
  opacity: 0.88;
  text-align: center;
  line-height: 1.4;
`

const BestScoreRow = styled.span`
  font-size: 0.78rem;
  opacity: 0.8;
  margin-top: 4px;
`

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`

const FixedBottomRow = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
`

// ─── Component ─────────────────────────────────────────────────────────────────

const DIFFICULTIES: {
  id: Difficulty
  label: string
  emoji: string
  detail: string
  color: string
  hoverColor: string
}[] = [
    {
      id: 'easy',
      label: 'EASY',
      emoji: '🌱',
      detail: '3×4 그리드\n12장 카드',
      color: '#48bb78',
      hoverColor: '#38a169',
    },
    {
      id: 'normal',
      label: 'NORMAL',
      emoji: '⚡',
      detail: '4×4 그리드\n16장 카드',
      color: '#4299e1',
      hoverColor: '#3182ce',
    },
    {
      id: 'hard',
      label: 'HARD',
      emoji: '🔥',
      detail: '4×5 그리드\n20장 카드',
      color: '#e53e3e',
      hoverColor: '#c53030',
    },
  ]

/**
 * DifficultyScreen Component
 * 게임 시작 전 난이도를 선택하는 화면입니다.
 */
export const DifficultyScreen: FC<DifficultyScreenProps> = ({
  onSelectDifficulty,
}) => {
  const { getBestScore } = useBestScore()
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)

  return (
    <Container>
      <Title>🃏 카드 짝 맞추기</Title>
      <Subtitle>난이도를 선택하세요</Subtitle>
      <DifficultyGrid>
        {DIFFICULTIES.map(({ id, label, emoji, detail, color, hoverColor }) => {
          const best = getBestScore(id)
          return (
            <DifficultyCard
              key={id}
              $color={color}
              $hoverColor={hoverColor}
              onClick={() => onSelectDifficulty(id)}
              data-testid={`difficulty-${id}`}
            >
              <DifficultyEmoji>{emoji}</DifficultyEmoji>
              <DifficultyLabel>{label}</DifficultyLabel>
              <DifficultyDetail>{detail.replace('\\n', '\n')}</DifficultyDetail>
              <BestScoreRow>
                {best > 0 ? `🏆 최고: ${best.toLocaleString()}점` : '기록 없음'}
              </BestScoreRow>
            </DifficultyCard>
          )
        })}
      </DifficultyGrid>
      <Subtitle style={{ fontSize: '0.9rem', opacity: 0.7 }}>
        남은 기회: 3회 · 힌트 1회 사용 가능
      </Subtitle>

      <FixedBottomRow>
        <IconButton onClick={() => setIsThemeModalOpen(true)}>
          🎨 테마 설정
        </IconButton>
        <IconButton onClick={() => setIsStatsModalOpen(true)}>
          📊 통계 보기
        </IconButton>
      </FixedBottomRow>

      <ThemeSettingsModal 
        isOpen={isThemeModalOpen} 
        onClose={() => setIsThemeModalOpen(false)} 
      />

      <StatisticsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
      />
    </Container>
  )
}

export default DifficultyScreen
