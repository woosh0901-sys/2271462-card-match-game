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
}

/**
 * Game Context
 * 전역 게임 상태를 관리하는 Context
 */
const GameContext = createContext<GameContextType | undefined>(undefined)

/**
 * Game Reducer
 * 게임 상태 변경 로직을 처리하는 Reducer 함수
 *
 * @param state - 현재 게임 상태
 * @param action - 실행할 액션
 * @returns 새로운 게임 상태
 *
 * @example
 * dispatch({ type: 'INIT_GAME', payload: { gameId: '123', cards: [...] } })
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT_GAME':
      // 게임 초기화: 서버에서 받은 카드 배열과 gameId 설정
      return {
        ...state,
        gameId: action.payload.gameId,
        cards: action.payload.cards,
        flippedCards: [],
        life: 3,
        status: 'PLAYING',
        isLoading: false,
        error: null,
        isMatching: false,
      }

    case 'FLIP_CARD':
      // 카드 뒤집기: 해당 카드의 isFlipped를 true로 변경
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

    case 'MATCH_SUCCESS':
      // 매칭 성공: 두 카드의 isSolved를 true로 변경하고 flippedCards 비우기
      return {
        ...state,
        cards: state.cards.map((card) =>
          action.payload.cardIds.includes(card.id)
            ? { ...card, isSolved: true }
            : card
        ),
        flippedCards: [],
      }

    case 'MATCH_FAIL':
      // 매칭 실패: 두 카드의 isFlipped를 false로 변경하고 life 차감
      return {
        ...state,
        cards: state.cards.map((card) =>
          action.payload.cardIds.includes(card.id)
            ? { ...card, isFlipped: false }
            : card
        ),
        flippedCards: [],
        life: state.life - 1,
      }

    case 'GAME_OVER':
      // 게임 오버: status를 'GAME_OVER'로 변경
      return {
        ...state,
        status: 'GAME_OVER',
      }

    case 'VICTORY':
      // 승리: status를 'VICTORY'로 변경
      return {
        ...state,
        status: 'VICTORY',
      }

    case 'RESET_GAME':
      // 게임 재시작: 초기 상태로 되돌리기
      return initialState

    case 'SET_LOADING':
      // 로딩 상태 변경
      return {
        ...state,
        isLoading: action.payload,
      }

    case 'SET_ERROR':
      // 에러 메시지 설정
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }

    case 'SET_MATCHING':
      // 매칭 판별 중 여부 설정
      return {
        ...state,
        isMatching: action.payload,
      }

    default:
      return state
  }
}

/**
 * GameProvider Props
 */
interface GameProviderProps {
  children: ReactNode
}

/**
 * GameProvider Component
 * 전역 게임 상태를 제공하는 Provider 컴포넌트
 *
 * @param children - 자식 컴포넌트들
 * @returns GameContext.Provider로 래핑된 children
 *
 * @example
 * <GameProvider>
 *   <App />
 * </GameProvider>
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
 *
 * @returns GameContext의 state와 dispatch
 * @throws Context가 Provider 외부에서 사용될 경우 에러 발생
 *
 * @example
 * const { state, dispatch } = useGameContext()
 * dispatch({ type: 'FLIP_CARD', payload: { cardId: '123' } })
 */
export function useGameContext() {
  const context = useContext(GameContext)

  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider')
  }

  return context
}

export default GameContext
