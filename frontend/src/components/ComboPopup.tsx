import { useEffect, useRef, useState } from 'react'
import type { FC } from 'react'
import styled, { keyframes } from 'styled-components'

interface ComboPopupProps {
  combo: number
}

// ─── 애니메이션 ────────────────────────────────────────────────────────────────

const popIn = keyframes`
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
  50%  { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
  65%  { transform: translate(-50%, -50%) scale(0.95); }
  80%  { transform: translate(-50%, -50%) scale(1.05); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`

const fadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; transform: translate(-50%, -50%) translateY(-20px); }
`

// ─── Styled Components ─────────────────────────────────────────────────────────

const PopupWrapper = styled.div<{ $fading: boolean }>`
  position: fixed;
  top: 45%;
  left: 50%;
  pointer-events: none;
  z-index: 200;
  animation: ${({ $fading }) => ($fading ? fadeOut : popIn)} 
    ${({ $fading }) => ($fading ? '0.4s' : '0.35s')} ease forwards;
`

const ComboText = styled.div`
  font-size: 3rem;
  font-weight: 900;
  color: #fff;
  text-shadow:
    0 0 20px rgba(255, 200, 0, 0.9),
    0 2px 0 rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  user-select: none;
`

const SubText = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 240, 100, 0.95);
  text-align: center;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 2px;
  margin-top: -4px;
`

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * ComboPopup Component
 * 콤보 2 이상 달성 시 화면 중앙에 팝업으로 표시됩니다.
 * 0.8초 후 자동으로 사라집니다.
 */
export const ComboPopup: FC<ComboPopupProps> = ({ combo }) => {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const [displayCombo, setDisplayCombo] = useState(combo)
  const prevComboRef = useRef(combo)

  useEffect(() => {
    const prev = prevComboRef.current
    prevComboRef.current = combo

    if (combo >= 2 && combo > prev) {
      // setState는 타이머 콜백 안에서만 호출
      const showTimer = setTimeout(() => {
        setDisplayCombo(combo)
        setFading(false)
        setVisible(true)
      }, 0)
      const fadeTimer = setTimeout(() => setFading(true), 800)
      const hideTimer = setTimeout(() => setVisible(false), 1200)

      return () => {
        clearTimeout(showTimer)
        clearTimeout(fadeTimer)
        clearTimeout(hideTimer)
      }
    }

    if (combo < 2) {
      const resetTimer = setTimeout(() => setVisible(false), 0)
      return () => clearTimeout(resetTimer)
    }
  }, [combo])

  if (!visible) return null

  const emoji = displayCombo >= 5 ? '🔥🔥' : displayCombo >= 3 ? '🔥' : '⭐'

  return (
    <PopupWrapper $fading={fading}>
      <ComboText>
        {emoji} {displayCombo} COMBO!
      </ComboText>
      <SubText>+{100 + (displayCombo - 1) * 50}점</SubText>
    </PopupWrapper>
  )
}

export default ComboPopup
