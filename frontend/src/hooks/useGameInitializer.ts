import { useEffect } from 'react'
import { useGameContext } from '../contexts/GameContext'
import { startGame } from '../api/gameApi'
import { preloadFruitAssets } from '../utils/fruitEmojis'

/**
 * useGameInitializer Hook
 * 게임 초기화 로직을 처리하는 커스텀 훅
 *
 * - 컴포넌트 마운트 시 /api/game/start API를 자동으로 호출합니다.
 * - API 응답을 받아 INIT_GAME 액션을 디스패치합니다.
 * - 로딩 상태(isLoading)와 에러 상태(error)를 Context를 통해 관리합니다.
 * - API 호출 실패 시 alert로 에러 메시지를 표시합니다.
 *
 * @example
 * function App() {
 *   useGameInitializer()
 *
 *   return <div>...</div>
 * }
 */
export function useGameInitializer(): void {
  const { state, dispatch } = useGameContext()

  useEffect(() => {
    // 이미 게임이 초기화되었거나 로딩 중이면 API 호출을 건너뜀
    if (state.gameId !== null || state.isLoading) {
      return
    }

    // 게임 초기화 함수
    const initializeGame = async () => {
      // 로딩 시작
      dispatch({ type: 'SET_LOADING', payload: true })

      try {
        // 1. 과일 에셋 preload (emoji 또는 이미지)
        await preloadFruitAssets()
        console.log('[Assets Preloaded] Fruit assets loaded successfully')

        // 2. API 호출
        const { gameId, cards } = await startGame()

        // 3. 게임 초기화 액션 디스패치
        dispatch({
          type: 'INIT_GAME',
          payload: { gameId, cards },
        })

        console.log(`[Game Initialized] gameId: ${gameId}, cards: ${cards.length}`)
      } catch (error) {
        // 에러 메시지 추출
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'

        // Context에 에러 상태 저장
        dispatch({
          type: 'SET_ERROR',
          payload: errorMessage,
        })

        // 사용자에게 alert로 에러 알림
        alert(`게임 초기화 실패\n\n${errorMessage}`)

        console.error('[Game Initialization Error]', error)
      }
    }

    // 게임 초기화 실행
    initializeGame()
  }, [state.gameId, state.isLoading, dispatch])
}
