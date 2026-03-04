import { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { GameState, GameAction } from '../types/GameState'

/**
 * GameContext Interface
 * Context에서 제공할 값의 타입 정의
 */
interface GameContextType {
  state: GameState
  dispatch: React.Dispatch<GameAction>
}

/**
 * Initial Game State
 * 게임의 초기 상태 정의
 */
export const initialState: GameState = {
  gameId: null,
  cards: [],
  flippedCards: [],
  life: 3,
  status: 'IDLE',
  isLoading: false,
  error: null,
  isMatching: false,
  // 신규 필드
  score: 0,
  combo: 0,
  maxCombo: 0,
  elapsedTime: 0,
  difficulty: 'normal',
  gridCols: 4,
  hintUsed: false,
  isHinting: false,
}

const GameContext = createContext<GameContextType | undefined>(undefined)

/**
 * 매칭 성공 점수 계산
 * 기본 100점 + 콤보 보너스 (콤보 × 50)
 */
function calcScore(currentScore: number, combo: number): number {
  return currentScore + 100 + combo * 50
}

/**
 * Game Reducer
 * 게임 상태 변경 로직을 처리하는 Reducer 함수
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT_GAME':
      return {
        ...state,
        gameId: action.payload.gameId,
        cards: action.payload.cards,
        difficulty: action.payload.difficulty,
        gridCols: action.payload.gridCols,
        flippedCards: [],
        life: 3,
        status: 'PLAYING',
        isLoading: false,
        error: null,
        isMatching: false,
        score: 0,
        combo: 0,
        maxCombo: 0,
        elapsedTime: 0,
        hintUsed: false,
        isHinting: false,
      }

    case 'SET_DIFFICULTY':
      return {
        ...state,
        difficulty: action.payload.difficulty,
        gridCols: action.payload.gridCols,
      }

    case 'FLIP_CARD':
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === action.payload.cardId ? { ...card, isFlipped: true } : card
        ),
        flippedCards: [
          ...state.flippedCards,
          state.cards.find((card) => card.id === action.payload.cardId)!,
        ],
      }

    case 'MATCH_SUCCESS': {
      // 콤보 계산 (이전 콤보 기준으로 점수 차등)
      const newCombo = state.combo + 1
      const newScore = calcScore(state.score, state.combo)
      const newMaxCombo = Math.max(state.maxCombo, newCombo)
      return {
        ...state,
        cards: state.cards.map((card) =>
          action.payload.cardIds.includes(card.id)
            ? { ...card, isSolved: true, isShaking: false }
            : card
        ),
        flippedCards: [],
        score: newScore,
        combo: newCombo,
        maxCombo: newMaxCombo,
      }
    }

    case 'MATCH_FAIL':
      // 실패한 카드에 shake 표시, 콤보 리셋
      return {
        ...state,
        cards: state.cards.map((card) =>
          action.payload.cardIds.includes(card.id)
            ? { ...card, isFlipped: false, isShaking: true }
            : card
        ),
        flippedCards: [],
        life: state.life - 1,
        combo: 0,
      }

    case 'GAME_OVER':
      return { ...state, status: 'GAME_OVER' }

    case 'VICTORY':
      return { ...state, status: 'VICTORY' }

    case 'RESET_GAME':
      return initialState

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }

    case 'SET_MATCHING':
      return { ...state, isMatching: action.payload }

    case 'TICK_TIMER':
      // PLAYING 상태에서만 타이머 증가
      if (state.status !== 'PLAYING') return state
      return { ...state, elapsedTime: state.elapsedTime + 1 }

    case 'USE_HINT':
      // 힌트: life 1 감소, hintUsed = true
      return {
        ...state,
        hintUsed: true,
        life: state.life - 1,
      }

    case 'SET_HINTING':
      return { ...state, isHinting: action.payload }

    default:
      return state
  }
}

interface GameProviderProps {
  children: ReactNode
}

/**
 * GameProvider Component
 * 전역 게임 상태를 제공하는 Provider 컴포넌트
 */
export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

/**
 * useGameContext Hook
 * GameContext를 사용하기 위한 커스텀 훅
 */
export function useGameContext() {
  const context = useContext(GameContext)

  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider')
  }

  return context
}

export default GameContext
