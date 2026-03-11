import { useCallback } from 'react'
import type { Difficulty } from '../types/Card'

export interface DifficultyStats {
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  maxStreak: number
  bestScore: number
}

const STATS_KEY_PREFIX = 'cardGame_stats_'

const defaultStats: DifficultyStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  bestScore: 0,
}

/**
 * useStatistics Hook
 * 난이도별 게임 통계(플레이 횟수, 승률, 연승, 최고기록 등)를 관리합니다.
 */
export function useStatistics() {
  const getStats = useCallback((difficulty: Difficulty): DifficultyStats => {
    const key = `${STATS_KEY_PREFIX}${difficulty}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        return JSON.parse(stored) as DifficultyStats
      } catch (e) {
        console.error('Failed to parse statistics', e)
      }
    }
    return { ...defaultStats }
  }, [])

  const saveStats = useCallback((difficulty: Difficulty, stats: DifficultyStats) => {
    const key = `${STATS_KEY_PREFIX}${difficulty}`
    localStorage.setItem(key, JSON.stringify(stats))
  }, [])

  /** 승리 시 통계 업데이트 (최고 기록 갱신 여부 반환) */
  const recordWin = useCallback(
    (difficulty: Difficulty, score: number): boolean => {
      const stats = getStats(difficulty)
      const isNewBest = score > stats.bestScore

      const newStats: DifficultyStats = {
        ...stats,
        gamesPlayed: stats.gamesPlayed + 1,
        gamesWon: stats.gamesWon + 1,
        currentStreak: stats.currentStreak + 1,
        maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
        bestScore: isNewBest ? score : stats.bestScore,
      }

      saveStats(difficulty, newStats)
      return isNewBest
    },
    [getStats, saveStats]
  )

  /** 패배 시 통계 업데이트 (연승 초기화) */
  const recordLoss = useCallback(
    (difficulty: Difficulty) => {
      const stats = getStats(difficulty)
      const newStats: DifficultyStats = {
        ...stats,
        gamesPlayed: stats.gamesPlayed + 1,
        currentStreak: 0,
      }
      saveStats(difficulty, newStats)
    },
    [getStats, saveStats]
  )

  return { getStats, recordWin, recordLoss }
}
