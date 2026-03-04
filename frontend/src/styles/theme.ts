/**
 * Design Token System
 * 디자인 시스템의 기본 토큰 정의
 *
 * 이 파일은 색상, 폰트, 간격 등의 디자인 요소를 중앙에서 관리합니다.
 * 테마 변경(다크 모드 등)을 용이하게 하고, 일관된 디자인을 보장합니다.
 */

export const theme = {
  /**
   * Color Palette
   * 게임에서 사용하는 색상 팔레트
   */
  colors: {
    // Primary Colors
    primary: '#3498db',
    primaryHover: '#2980b9',
    primaryLight: '#5dade2',

    // Background Colors
    background: '#f0f2f5',
    cardBack: '#2c3e50',
    cardFront: '#ffffff',

    // Status Colors
    success: '#27ae60',
    danger: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db',

    // Text Colors
    textPrimary: '#2c3e50',
    textSecondary: '#7f8c8d',
    textLight: '#ffffff',

    // UI Colors
    border: '#bdc3c7',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  /**
   * Typography
   * 폰트 관련 설정
   */
  fonts: {
    primary: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    monospace: "'Courier New', Courier, monospace",
  },

  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
  },

  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  /**
   * Spacing
   * 간격 시스템 (4px 단위)
   */
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  /**
   * Border Radius
   * 모서리 둥글기
   */
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%',
  },

  /**
   * Shadows
   * 그림자 효과
   */
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.15)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.2)',
  },

  /**
   * Transitions
   * 애니메이션 전환 효과
   */
  transitions: {
    fast: '0.15s ease-in-out',
    normal: '0.3s ease-in-out',
    slow: '0.5s ease-in-out',
  },

  /**
   * Z-Index
   * 레이어 순서
   */
  zIndex: {
    base: 1,
    dropdown: 10,
    modal: 100,
    tooltip: 1000,
  },

  /**
   * Breakpoints
   * 반응형 디자인 중단점
   */
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },
};

/**
 * Theme Type
 * TypeScript 타입 추론을 위한 타입 정의
 */
export type Theme = typeof theme;

export default theme;
