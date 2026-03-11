import { useState, type FC } from 'react'
import styled from 'styled-components'
import { useStatistics } from '../hooks/useStatistics'
import type { Difficulty } from '../types/Card'

interface StatisticsModalProps {
  isOpen: boolean
  onClose: () => void
}

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition: opacity 0.3s ease;
`

const ModalContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.cardFront};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  min-width: 340px;
  max-width: 90vw;
`

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  display: flex;
  align-items: center;
  gap: 8px;
`

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px;
  border-radius: 8px;
  width: 100%;
`

const TabButton = styled.button<{ $isActive: boolean }>`
  flex: 1;
  padding: 8px;
  border: none;
  background: ${({ $isActive, theme }) => ($isActive ? theme.colors.background : 'transparent')};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: ${({ $isActive }) => ($isActive ? 'bold' : 'normal')};
  border-radius: 4px;
  cursor: pointer;
  box-shadow: ${({ $isActive }) => ($isActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none')};
  transition: all 0.2s;

  &:hover {
    background: ${({ $isActive, theme }) => ($isActive ? theme.colors.background : 'rgba(0,0,0,0.02)')};
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
`

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const StatLabel = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`

const StatValue = styled.span`
  font-size: 1.4rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`

const CloseButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.md};
  width: 100%;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`

export const StatisticsModal: FC<StatisticsModalProps> = ({ isOpen, onClose }) => {
  const { getStats } = useStatistics()
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>('normal')

  if (!isOpen) return null

  const stats = getStats(selectedDiff)
  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0

  return (
    <Overlay $isOpen={isOpen} onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>📊 기록 통계</Title>
        
        <Tabs>
          <TabButton $isActive={selectedDiff === 'easy'} onClick={() => setSelectedDiff('easy')}>EASY</TabButton>
          <TabButton $isActive={selectedDiff === 'normal'} onClick={() => setSelectedDiff('normal')}>NORMAL</TabButton>
          <TabButton $isActive={selectedDiff === 'hard'} onClick={() => setSelectedDiff('hard')}>HARD</TabButton>
        </Tabs>

        <StatsGrid>
          <StatCard>
            <StatLabel>플레이 횟수</StatLabel>
            <StatValue>{stats.gamesPlayed}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>승률</StatLabel>
            <StatValue>{winRate}%</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>최고 점수</StatLabel>
            <StatValue>{stats.bestScore.toLocaleString()}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>최대 연승</StatLabel>
            <StatValue>{stats.maxStreak}</StatValue>
          </StatCard>
        </StatsGrid>

        <CloseButton onClick={onClose}>닫기</CloseButton>
      </ModalContainer>
    </Overlay>
  )
}
