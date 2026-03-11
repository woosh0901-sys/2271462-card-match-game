import { useCallback, useEffect, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { GlobalStyle } from './styles/GlobalStyle'
import theme from './styles/theme'
import { Header } from './components/Header'
import { GameBoard } from './components/GameBoard'
import { ResultModal } from './components/ResultModal'
import { DifficultyScreen } from './components/DifficultyScreen'
import { ComboPopup } from './components/ComboPopup'
import { SettingsModal } from './components/SettingsModal'
import { GameProvider, useGameContext } from './contexts/GameContext'
import { useTimer } from './hooks/useTimer'
import { useBestScore } from './hooks/useBestScore'
import { useSound } from './hooks/useSound'
import { startGame } from './api/gameApi'
import type { Difficulty } from './types/Card'

// ─── Styled Components ─────────────────────────────────────────────────────────

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
`

const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  width: 100%;
  max-width: 900px;
`

const GameContainer = styled.div<{ $aspectRatio: string }>`
  width: 100%;
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio};
  background-color: ${({ theme }) => theme.colors.cardFront};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 640px) {
    min-height: 500px;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.md};
  text-align: center;
  height: 100%;
`

// ─── Game Component ─────────────────────────────────────────────────────────────

/**
 * Game Component
 * 실제 게임 로직 및 UI를 담당.
 * GameProvider 내부에서 사용됩니다.
 */
function Game() {
  useTimer()

  const { state, dispatch } = useGameContext()
  const { getBestScore, trySetBestScore } = useBestScore()
  const { playFlip, playMatch, playFail, playVictory, playGameOver } = useSound()

  // 승리 직후 최고기록 갱신 여부 tracking
  const [isNewBest, setIsNewBest] = useState(false)

  // 난이도별 게임 컨테이너 종횡비 계산
  const getAspectRatio = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy':
        return '3/4' // 3열 4행
      case 'hard':
        return '5/4' // 5열 4행
      case 'normal':
      default:
        return '1'   // 4열 4행 (1:1)
    }
  }

  // ─── 승리 조건 판정 (Plan.md 티켓 #18) ──────────────────────────────────────
  useEffect(() => {
    if (
      state.status === 'PLAYING' &&
      state.cards.length > 0 &&
      state.cards.every((c) => c.isSolved)
    ) {
      dispatch({ type: 'VICTORY' })
    }
  }, [state.cards, state.status, dispatch])

  // ─── 게임 오버 판정 (Plan.md 티켓 #17) ─────────────────────────────────────
  useEffect(() => {
    if (state.life === 0 && state.status === 'PLAYING') {
      dispatch({ type: 'GAME_OVER' })
    }
  }, [state.life, state.status, dispatch])

  // ─── 효과음: 승리 / 게임오버 ─────────────────────────────────────────────────
  // useCallback으로 안정적인 참조 확보 → exhaustive-deps 경고 없이 의존성 최소화
  const handleGameEnd = useCallback(() => {
    if (state.status === 'VICTORY') {
      playVictory()
      const newBest = trySetBestScore(state.difficulty, state.score)
      setIsNewBest(newBest)
    } else if (state.status === 'GAME_OVER') {
      playGameOver()
    }
    // playVictory/playFail/trySetBestScore은 useCallback으로 안정적이므로 deps에 포함
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.difficulty, state.score])

  useEffect(() => {
    handleGameEnd()
  }, [handleGameEnd])

  // ─── ESC 키 이벤트 등록 (설정창/일시정지) ──────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state.status === 'PLAYING') {
          // 일시정지 상태 토글
          dispatch({ type: 'SET_PAUSE', payload: !state.isPaused })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.status, state.isPaused, dispatch])

  // ─── 매칭 판별 로직 (Plan.md 티켓 #16) ─────────────────────────────────────
  useEffect(() => {
    if (state.flippedCards.length !== 2) return

    dispatch({ type: 'SET_MATCHING', payload: true })

    const [firstCard, secondCard] = state.flippedCards

    if (firstCard.type === secondCard.type) {
      playMatch()
      dispatch({
        type: 'MATCH_SUCCESS',
        payload: { cardIds: [firstCard.id, secondCard.id] },
      })
      dispatch({ type: 'SET_MATCHING', payload: false })
    } else {
      playFail()
      const timeoutId = setTimeout(() => {
        dispatch({
          type: 'MATCH_FAIL',
          payload: { cardIds: [firstCard.id, secondCard.id] },
        })
        dispatch({ type: 'SET_MATCHING', payload: false })
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
    // playMatch/playFail은 useCallback으로 안정적 — state.flippedCards 변경 시만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.flippedCards, dispatch])

  // ─── shake CSS 애니메이션: MATCH_FAIL 시 자동 처리됨 (isShaking prop → Card.tsx keyframe)
  // CardContainer의 animation prop이 isShaking 상태를 CSS로 처리하므로 별도 JS 타이머 불필요

  // ─── 카드 클릭 핸들러 (Plan.md 티켓 #15) ────────────────────────────────────
  const handleCardClick = (cardId: string) => {
    const clickedCard = state.cards.find((card) => card.id === cardId)
    if (!clickedCard) return
    if (clickedCard.isSolved) return
    if (clickedCard.isFlipped) return
    if (state.flippedCards.length >= 2) return
    if (state.isMatching) return
    if (state.status !== 'PLAYING') return
    if (state.isPaused) return // 일시정지 중 클릭 방지

    playFlip()
    dispatch({ type: 'FLIP_CARD', payload: { cardId } })
  }

  // ─── 힌트 핸들러 (Plan.md 추가 기능) ────────────────────────────────────────
  const handleHint = () => {
    if (state.hintUsed || state.status !== 'PLAYING' || state.life <= 0) return

    dispatch({ type: 'USE_HINT' })
    dispatch({ type: 'SET_HINTING', payload: true })

    // 1.5초 후 힌트 종료
    setTimeout(() => {
      dispatch({ type: 'SET_HINTING', payload: false })
    }, 1500)
  }

  // ─── 게임 재시작 핸들러 (Plan.md 티켓 #23) ───────────────────────────────────
  const handleRestart = async () => {
    try {
      dispatch({ type: 'RESET_GAME' })
      dispatch({ type: 'SET_LOADING', payload: true })
      setIsNewBest(false)

      const { gameId, cards, difficulty, gridCols } = await startGame(state.difficulty)

      dispatch({
        type: 'INIT_GAME',
        payload: { gameId, cards, difficulty, gridCols },
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '게임 재시작에 실패했습니다'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      alert(`게임 재시작 실패\n\n${errorMessage}`)
    }
  }

  // ─── 메인 화면으로 돌아가기 핸들러 ──────────────────────────────────────────
  const handleMainMenu = () => {
    dispatch({ type: 'RESET_GAME' })
  }

  // ─── 로딩 / 에러 화면 ─────────────────────────────────────────────────────────
  if (state.isLoading) {
    return (
      <GameContainer $aspectRatio={getAspectRatio(state.difficulty)}>
        <LoadingContainer data-testid="loading-screen">Loading...</LoadingContainer>
      </GameContainer>
    )
  }

  if (state.error) {
    return (
      <GameContainer $aspectRatio={getAspectRatio(state.difficulty)}>
        <ErrorContainer>
          <div>⚠️ 게임을 시작할 수 없습니다</div>
          <div>{state.error}</div>
        </ErrorContainer>
      </GameContainer>
    )
  }

  const bestScore = getBestScore(state.difficulty)

  return (
    <>
      <GameWrapper>
        <Header
          life={state.life}
          score={state.score}
          combo={state.combo}
          elapsedTime={state.elapsedTime}
          hintUsed={state.hintUsed}
          onHint={handleHint}
          isPlaying={state.status === 'PLAYING'}
        />
        <GameContainer $aspectRatio={getAspectRatio(state.difficulty)}>
          <GameBoard
            cards={state.cards}
            onCardClick={handleCardClick}
            isMatching={state.isMatching}
            gridCols={state.gridCols}
            isHinting={state.isHinting}
          />
        </GameContainer>
      </GameWrapper>

      {/* 콤보 팝업 */}
      <ComboPopup combo={state.combo} />

      {/* 결과 모달 (PRD: 게임 오버 / 승리 시) */}
      <ResultModal
        isOpen={state.status === 'VICTORY' || state.status === 'GAME_OVER'}
        result={state.status as 'VICTORY' | 'GAME_OVER'}
        onRestart={handleRestart}
        score={state.score}
        bestScore={bestScore}
        maxCombo={state.maxCombo}
        elapsedTime={state.elapsedTime}
        isNewBest={isNewBest}
      />

      {/* 일시정지 (설정) 모달 */}
      <SettingsModal
        isOpen={state.isPaused}
        onResume={() => dispatch({ type: 'SET_PAUSE', payload: false })}
        onMainMenu={handleMainMenu}
      />
    </>
  )
}

// ─── DifficultyGate ─────────────────────────────────────────────────────────────

/**
 * DifficultyGate
 * IDLE 상태에서는 난이도 선택 화면을 표시하고,
 * 선택 후 INIT_GAME을 dispatch하여 게임을 시작합니다.
 */
function DifficultyGate() {
  const { state, dispatch } = useGameContext()

  const handleSelectDifficulty = async (difficulty: Difficulty) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const { gameId, cards, gridCols } = await startGame(difficulty)
      dispatch({
        type: 'INIT_GAME',
        payload: { gameId, cards, difficulty, gridCols },
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '서버 연결에 실패했습니다'
      alert(`게임 시작 실패: ${errorMessage}`)
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // IDLE 상태 → 난이도 선택 화면
  if (state.status === 'IDLE' && !state.isLoading) {
    return <DifficultyScreen onSelectDifficulty={handleSelectDifficulty} />
  }

  // 로딩 중
  if (state.isLoading && state.status === 'IDLE') {
    return (
      <AppContainer>
        <LoadingContainer>Loading...</LoadingContainer>
      </AppContainer>
    )
  }

  // 게임 컨테이너
  return (
    <AppContainer>
      <Game />
    </AppContainer>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────────

/**
 * App Component
 * 전체 앱의 루트 컴포넌트
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <GameProvider>
        <DifficultyGate />
      </GameProvider>
    </ThemeProvider>
  )
}

export default App
