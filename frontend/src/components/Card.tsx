import styled from 'styled-components'
import type { Card as CardType } from '../types/Card'
import { getFruitEmoji } from '../utils/fruitEmojis'

/**
 * Card Props Interface
 */
interface CardProps {
  /** 카드 데이터 */
  cardData: CardType
  /** 클릭 이벤트 핸들러 */
  onClick: () => void
}

/**
 * Card Container
 * 반응형 카드 크기 (부모 그리드에 맞춰 자동 조절)
 * perspective를 적용하여 3D 효과 활성화
 */
const CardContainer = styled.div`
  width: 100%; /* 부모 GridCell에 100% 맞춤 */
  height: 100%; /* 높이도 100% 맞춤 */
  min-width: 100px; /* 최소 크기 보장 */
  min-height: 100px; /* 최소 크기 보장 */
  cursor: pointer;
  position: relative;
  perspective: 1000px; /* 3D 효과를 위한 perspective */
`

/**
 * Card Inner
 * 카드의 실제 회전을 담당하는 래퍼
 * isFlipped 또는 isSolved일 때 180도 회전
 */
const CardInner = styled.div<{ $showFront: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d; /* 3D 변환 유지 */
  transition: transform 0.5s; /* 0.5초 애니메이션 */
  transform: ${({ $showFront }) =>
    $showFront ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`

/**
 * Card Face (앞면/뒷면 공통 스타일)
 */
const CardFace = styled.div`
  width: 100%;
  height: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.md}; /* 8px */
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  backface-visibility: hidden;
`

/**
 * Card Back (뒷면)
 */
const CardBack = styled(CardFace)`
  background-color: ${({ theme }) => theme.colors.cardBack}; /* #2c3e50 */
  box-shadow: ${({ theme }) => theme.shadows.md};
`

/**
 * Card Front (앞면)
 * 처음부터 180도 회전된 상태로 시작 (CardInner가 회전하면 정면을 향함)
 */
const CardFront = styled(CardFace)`
  background-color: ${({ theme }) => theme.colors.cardFront}; /* 흰색 */
  box-shadow: ${({ theme }) => theme.shadows.md};
  transform: rotateY(180deg); /* 앞면은 처음부터 180도 회전 */
`

/**
 * Card Emoji
 * 과일 emoji를 표시하는 컴포넌트
 * 이미지가 없는 경우 emoji를 대안으로 사용
 * 카드 크기에 비례하여 반응형으로 조절
 */
const CardEmoji = styled.div`
  font-size: clamp(48px, 6vw, 72px); /* 반응형 emoji 크기 (더 크게) */
  user-select: none; /* 드래그 방지 */
  line-height: 1;
`

/**
 * Card Component
 * 게임 카드를 표시하는 컴포넌트
 *
 * @param {CardType} cardData - 카드 데이터 (id, type, imgUrl, isFlipped, isSolved)
 * @param {Function} onClick - 클릭 이벤트 핸들러
 * @returns {JSX.Element} Card 컴포넌트
 *
 * @example
 * <Card
 *   cardData={card}
 *   onClick={() => handleCardClick(card.id)}
 * />
 */
export const Card: React.FC<CardProps> = ({ cardData, onClick }) => {
  const { type, isFlipped, isSolved } = cardData

  // 카드가 뒤집혔거나 짝이 맞춰진 경우 앞면 표시
  const showFront = isFlipped || isSolved

  return (
    <CardContainer
      onClick={onClick}
      data-testid={`card-${cardData.id}`}
      data-card-type={type}
      data-is-flipped={String(isFlipped)}
      data-is-solved={String(isSolved)}
    >
      <CardInner $showFront={showFront}>
        {/* 카드 뒷면 (기본 상태) */}
        <CardBack />
        {/* 카드 앞면 (180도 회전된 상태로 대기) */}
        <CardFront>
          {/* 과일 emoji 표시 (이미지 대안) */}
          <CardEmoji>{getFruitEmoji(type)}</CardEmoji>
        </CardFront>
      </CardInner>
    </CardContainer>
  )
}

export default Card
