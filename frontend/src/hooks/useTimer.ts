import { useEffect, useRef } from 'react'
import { useGameContext } from '../contexts/GameContext'

/**
 * useTimer Hook
 * 게임 상태가 PLAYING일 때 1초마다 TICK_TIMER를 dispatch합니다.
 * GAME_OVER / VICTORY 시 자동으로 타이머를 멈춥니다.
 */
export function useTimer() {
    const { state, dispatch } = useGameContext()
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        // PLAYING 상태이고 게임이 일시정지(isPaused)되지 않았을 때만 작동
        if (state.status === 'PLAYING' && !state.isPaused) {
            intervalRef.current = setInterval(() => {
                dispatch({ type: 'TICK_TIMER' })
            }, 1000)
        } else {
            // 게임 종료/일시정지 시 타이머 정지
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }

        return () => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [state.status, state.isPaused, dispatch])
}
