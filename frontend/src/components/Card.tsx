import styled, { keyframes } from 'styled-components'
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
  /** 힌트 활성 시 강제로 앞면 표시 */
  forceFlip?: boolean
}

// ─── Shake 애니메이션 (PRD 5.2 매칭 실패 진동 효과) ────────────────────────────
const shakeAnim = keyframes`
  0%   { transform: translateX(0); }
  15%  { transform: translateX(-6px) rotate(-2deg); }
  30%  { transform: translateX(6px) rotate(2deg); }
  45%  { transform: translateX(-5px) rotate(-1.5deg); }
  60%  { transform: translateX(5px) rotate(1.5deg); }
  75%  { transform: translateX(-3px); }
  90%  { transform: translateX(3px); }
  100% { transform: translateX(0); }
`

// ─── Solved 펄스 애니메이션 ────────────────────────────────────────────────────
const solvedPulse = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7); }
  70%  { box-shadow: 0 0 0 10px rgba(72, 187, 120, 0); }
  100% { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0); }
`

/**
 * Card Container
 * perspective를 적용하여 3D 효과 활성화
 */
const CardContainer = styled.div<{ $isShaking: boolean }>`
  width: 100%;
  height: 100%;
  min-width: 80px;
  min-height: 80px;
  cursor: pointer;
  position: relative;
  perspective: 1000px;
  animation: ${({ $isShaking }) => ($isShaking ? shakeAnim : 'none')} 0.5s ease;
`

/**
 * Card Inner
 * 카드의 실제 회전을 담당하는 래퍼
 */
const CardInner = styled.div<{ $showFront: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s;
  transform: ${({ $showFront }) => ($showFront ? 'rotateY(180deg)' : 'rotateY(0deg)')};
`

/**
 * Card Face (앞면/뒷면 공통 스타일)
 */
const CardFace = styled.div`
  width: 100%;
  height: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  backface-visibility: hidden;
`

/**
 * Card Back (뒷면) — TechSpec 7: Card Back: #2c3e50
 */
const CardBack = styled(CardFace)`
  background-color: ${({ theme }) => theme.colors.cardBack};
  box-shadow: ${({ theme }) => theme.shadows.md};
`

const BackPattern = styled.div`
  width: 60%;
  height: 60%;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  opacity: 0.4;
`

/**
 * Card Front (앞면)
 * isSolved일 때 success 색상 + 펄스 애니메이션 적용
 */
const CardFront = styled(CardFace) <{ $isSolved: boolean }>`
  background-color: ${({ theme, $isSolved }) =>
    $isSolved ? '#f0fff4' : theme.colors.cardFront};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transform: rotateY(180deg);
  border: ${({ $isSolved }) => ($isSolved ? '2px solid #48bb78' : 'none')};
  animation: ${({ $isSolved }) => ($isSolved ? solvedPulse : 'none')} 0.6s ease;
`

/**
 * Card Emoji — 반응형 크기
 */
const CardEmoji = styled.div`
  font-size: clamp(36px, 5vw, 64px);
  user-select: none;
  line-height: 1;
`

/**
 * Card Component
 * 게임 카드를 표시하는 컴포넌트
 * PRD AC: 클릭 시 3D Flip 애니메이션, 매칭 실패 시 Shake 애니메이션
 */
export const Card: React.FC<CardProps> = ({ cardData, onClick, forceFlip = false }) => {
  const { type, isFlipped, isSolved, isShaking } = cardData
  const showFront = isFlipped || isSolved || forceFlip

  return (
    <CardContainer
      onClick={onClick}
      $isShaking={!!isShaking}
      data-testid={`card-${cardData.id}`}
      data-card-type={type}
      data-is-flipped={String(isFlipped)}
      data-is-solved={String(isSolved)}
    >
      <CardInner $showFront={showFront}>
        {/* 카드 뒷면 */}
        <CardBack>
          <BackPattern>🃏</BackPattern>
        </CardBack>
        {/* 카드 앞면 */}
        <CardFront $isSolved={isSolved}>
          <CardEmoji>{getFruitEmoji(type)}</CardEmoji>
        </CardFront>
      </CardInner>
    </CardContainer>
  )
}

export default Card
