import { createContext, useContext, useState, type ReactNode } from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { themes, type ThemeName } from '../styles/theme'

interface ThemeContextType {
  themeName: ThemeName
  setThemeName: (name: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'cardGame_theme_preference'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null
    if (storedTheme && themes[storedTheme]) {
      return storedTheme
    }
    return 'default'
  })

  const setThemeName = (name: ThemeName) => {
    setThemeNameState(name)
    localStorage.setItem(THEME_STORAGE_KEY, name)
  }

  // 선택된 테마 객체
  const currentTheme = themes[themeName]

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName }}>
      <StyledThemeProvider theme={currentTheme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}
