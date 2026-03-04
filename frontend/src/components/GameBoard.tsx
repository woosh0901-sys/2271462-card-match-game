import styled from 'styled-components'
import type { Card as CardType } from '../types/Card'
import { Card } from './Card'

/**
 * GameBoard Props Interface
 */
interface GameBoardProps {
  /** 카드 배열 */
  cards: CardType[]
  /** 카드 클릭 핸들러 */
  onCardClick: (cardId: string) => void
  /** 매칭 판별 중 여부 (광클 방지용 — TechSpec 5.3) */
  isMatching: boolean
  /** 그리드 열 수 (Easy:3, Normal:4, Hard:5) */
  gridCols: number
  /** 힌트 활성화 여부 — 힌트 시 모든 카드 강제 앞면 */
  isHinting: boolean
}

/**
 * Game Board Container
 * 동적 CSS Grid: gridCols를 기반으로 열 수 결정
 * isMatching이 true일 때 pointer-events:none으로 광클 방지 (TechSpec 5.3)
 */
const BoardContainer = styled.div<{ $isMatching: boolean; $gridCols: number }>`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(${({ $gridCols }) => $gridCols}, 1fr);
  grid-auto-rows: 1fr;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.background};
  pointer-events: ${({ $isMatching }) => ($isMatching ? 'none' : 'auto')};
`

/**
 * Card Wrapper
 * Grid 셀을 꽉 채우고 정사각형 유지
 */
const CardWrapper = styled.div`
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`

/**
 * GameBoard Component
 * 카드들을 동적 Grid로 표시 (난이도별 column 수 변동)
 *
 * - Easy: 3×4 (12장)
 * - Normal: 4×4 (16장)
 * - Hard: 4×5 (20장, 5열 → grid-auto-rows로 행 자동 조절)
 */
export const GameBoard: React.FC<GameBoardProps> = ({
  cards,
  onCardClick,
  isMatching,
  gridCols,
  isHinting,
}) => {
  return (
    <BoardContainer
      $isMatching={isMatching || isHinting}
      $gridCols={gridCols}
      data-testid="game-board"
    >
      {cards.map((card) => (
        <CardWrapper key={card.id}>
          <Card
            cardData={card}
            onClick={() => onCardClick(card.id)}
            forceFlip={isHinting && !card.isSolved}
          />
        </CardWrapper>
      ))}
    </BoardContainer>
  )
}

export default GameBoard
