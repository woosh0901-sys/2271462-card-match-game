import styled from 'styled-components'
import type { Card as CardType } from '../types/Card'
import { Card } from './Card'

/**
 * GameBoard Props Interface
 */
interface GameBoardProps {
  /** 16개의 카드 배열 */
  cards: CardType[]
  /** 카드 클릭 핸들러 */
  onCardClick: (cardId: string) => void
  /** 매칭 판별 중 여부 (광클 방지용) */
  isMatching: boolean
}

/**
 * Game Board Container
 * 4x4 CSS Grid 레이아웃으로 카드들을 배치
 * isMatching이 true일 때 pointer-events: none으로 광클 방지
 */
const BoardContainer = styled.div<{ $isMatching: boolean }>`
  width: 100%; /* GameContainer 너비에 맞춤 */
  height: 100%; /* GameContainer 높이에 맞춤 */
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4열 고정 */
  grid-template-rows: repeat(4, 1fr); /* 4행 고정 (균등 배분) */
  gap: ${({ theme }) => theme.spacing.sm}; /* 10px */
  padding: ${({ theme }) => theme.spacing.sm}; /* 10px (md에서 sm으로 축소하여 카드 공간 확보) */
  background-color: ${({ theme }) => theme.colors.background};
  pointer-events: ${({ $isMatching }) =>
    $isMatching ? 'none' : 'auto'}; /* 매칭 판별 중에는 클릭 차단 */
`

/**
 * Card Wrapper
 * Card 컴포넌트를 Grid에 맞추기 위한 래퍼
 * width: 100%로 그리드 셀을 꽉 채우고, aspect-ratio로 정사각형 유지
 */
const CardWrapper = styled.div`
  width: 100%; /* 그리드 셀 너비에 맞춤 */
  aspect-ratio: 1; /* 정사각형 그리드 셀 유지 */
  display: flex;
  justify-content: center;
  align-items: center;
`

/**
 * GameBoard Component
 * 16개의 카드를 4x4 Grid로 표시하는 게임 보드
 *
 * @param {CardType[]} cards - 16개의 카드 배열
 * @param {Function} onCardClick - 카드 클릭 핸들러
 * @param {boolean} isMatching - 매칭 판별 중 여부 (광클 방지용)
 * @returns {JSX.Element} GameBoard 컴포넌트
 *
 * @example
 * <GameBoard cards={cards} onCardClick={handleCardClick} isMatching={false} />
 */
export const GameBoard: React.FC<GameBoardProps> = ({
  cards,
  onCardClick,
  isMatching,
}) => {
  return (
    <BoardContainer $isMatching={isMatching} data-testid="game-board">
      {cards.map((card) => (
        <CardWrapper key={card.id}>
          <Card cardData={card} onClick={() => onCardClick(card.id)} />
        </CardWrapper>
      ))}
    </BoardContainer>
  )
}

export default GameBoard
