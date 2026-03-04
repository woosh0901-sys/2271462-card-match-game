import { useCallback } from 'react'
import type { Difficulty } from '../types/Card'

const BEST_SCORE_KEY_PREFIX = 'cardGame_bestScore_'

/**
 * useBestScore Hook
 * LocalStorage에 난이도별 최고 점수를 저장/불러옵니다.
 */
export function useBestScore() {
    /** 현재 난이도의 최고 점수 불러오기 */
    const getBestScore = useCallback((difficulty: Difficulty): number => {
        const key = `${BEST_SCORE_KEY_PREFIX}${difficulty}`
        const stored = localStorage.getItem(key)
        return stored ? parseInt(stored, 10) : 0
    }, [])

    /**
     * 최고 점수 갱신 시도.
     * @returns true if new best score was set
     */
    const trySetBestScore = useCallback(
        (difficulty: Difficulty, score: number): boolean => {
            const current = getBestScore(difficulty)
            if (score > current) {
                const key = `${BEST_SCORE_KEY_PREFIX}${difficulty}`
                localStorage.setItem(key, String(score))
                return true
            }
            return false
        },
        [getBestScore]
    )

    return { getBestScore, trySetBestScore }
}
