import type { FC } from 'react'
import styled from 'styled-components'

interface SettingsModalProps {
  isOpen: boolean
  onResume: () => void
  onMainMenu: () => void
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
  min-width: 300px;
  max-width: 90vw;
`

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xxl};
`

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
`

const Button = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  background-color: ${({ theme, $variant }) =>
    $variant === 'danger' ? theme.colors.danger : theme.colors.primary};
  color: white;

  &:hover {
    background-color: ${({ theme, $variant }) =>
    $variant === 'danger' ? '#c0392b' : theme.colors.primaryHover};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`

/**
 * Settings Modal Component
 * Displays a pause menu with options to resume or return to main menu.
 */
export const SettingsModal: FC<SettingsModalProps> = ({
  isOpen,
  onResume,
  onMainMenu,
}) => {
  if (!isOpen) return null

  return (
    <Overlay $isOpen={isOpen} data-testid="settings-modal-overlay">
      <ModalContainer role="dialog" aria-modal="true">
        <Title>일시정지</Title>
        <ButtonGroup>
          <Button $variant="primary" onClick={onResume}>
            계속하기
          </Button>
          <Button $variant="danger" onClick={onMainMenu}>
            메인 화면으로
          </Button>
        </ButtonGroup>
      </ModalContainer>
    </Overlay>
  )
}
