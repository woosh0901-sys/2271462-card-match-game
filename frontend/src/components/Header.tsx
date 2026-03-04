import styled from 'styled-components'

/**
 * Header Props Interface
 */
interface HeaderProps {
  /** 남은 생명(기회) 수 */
  life: number
}

/**
 * Header Container
 * 게임 보드 상단에 고정 배치되는 헤더
 */
const HeaderContainer = styled.header`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.primary};
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primaryHover};
`

/**
 * Life Display Text
 * 남은 기회를 표시하는 텍스트
 */
const LifeText = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg}; /* 18px */
  font-weight: ${({ theme }) => theme.fontWeights.bold}; /* Bold */
  color: ${({ theme }) => theme.colors.textLight}; /* 흰색 */
  text-align: center;
  letter-spacing: 0.5px;
`

/**
 * Header Component
 * 게임의 남은 생명을 표시하는 헤더 컴포넌트
 *
 * @param {number} life - 남은 생명 수 (0-3)
 * @returns {JSX.Element} Header 컴포넌트
 *
 * @example
 * <Header life={3} />
 * // 출력: "남은 기회: 3/3"
 */
export const Header: React.FC<HeaderProps> = ({ life }) => {
  return (
    <HeaderContainer>
      <LifeText data-testid="life-display">남은 기회: {life}/3</LifeText>
    </HeaderContainer>
  )
}

export default Header
