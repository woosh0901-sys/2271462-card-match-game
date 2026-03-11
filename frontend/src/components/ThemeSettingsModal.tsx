import type { FC } from 'react'
import styled from 'styled-components'
import { useThemeContext } from '../contexts/ThemeContext'
import { themes, type ThemeName, type Theme } from '../styles/theme'

interface ThemeSettingsModalProps {
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
  min-width: 320px;
  max-width: 90vw;
`

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xxl};
`

const ThemeOptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
`

const ThemeOption = styled.button<{ $isActive: boolean; $themePreview: Theme }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, $isActive }) => ($isActive ? theme.colors.primary : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: transparent;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryLight};
    background-color: rgba(0, 0, 0, 0.05);
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme, $isActive }) => ($isActive ? theme.fontWeights.bold : theme.fontWeights.normal)};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`

const ColorPreview = styled.div<{ $bgColor: string; $cardColor: string }>`
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 4px;
  background-color: ${({ $bgColor }) => $bgColor};
  border: 1px solid #ccc;
  
  div {
    width: 20px;
    height: 30px;
    background-color: ${({ $cardColor }) => $cardColor};
    border-radius: 2px;
  }
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
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`

const THEME_LABELS: Record<ThemeName, string> = {
  default: '기본 (Default)',
  dark: '다크 모드 (Dark)',
  nature: '네이처 (Nature)'
}

export const ThemeSettingsModal: FC<ThemeSettingsModalProps> = ({ isOpen, onClose }) => {
  const { themeName, setThemeName } = useThemeContext()

  if (!isOpen) return null

  return (
    <Overlay $isOpen={isOpen} onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>🎨 테마 설정</Title>
        <ThemeOptionList>
          {(Object.keys(themes) as ThemeName[]).map((key) => {
            const previewTheme = themes[key]
            const isActive = themeName === key
            return (
              <ThemeOption
                key={key}
                $isActive={isActive}
                $themePreview={previewTheme}
                onClick={() => setThemeName(key)}
              >
                <span>{THEME_LABELS[key]}</span>
                <ColorPreview
                  $bgColor={previewTheme.colors.background}
                  $cardColor={previewTheme.colors.cardBack}
                >
                  <div />
                  <div />
                </ColorPreview>
              </ThemeOption>
            )
          })}
        </ThemeOptionList>
        <CloseButton onClick={onClose}>닫기</CloseButton>
      </ModalContainer>
    </Overlay>
  )
}
