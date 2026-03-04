import axios from 'axios'
import type { Card, Difficulty, FruitType } from '../types/Card'

/**
 * API Response for /api/game/start
 */
interface GameStartResponse {
  gameId: string
  difficulty: Difficulty
  gridCols: number
  cards: Array<{
    id: string
    type: string
    imgUrl: string
  }>
}

// 10가지 과일 타입 (폴백용, 백엔드 FRUIT_TYPES와 동일)
const ALL_FRUIT_TYPES: FruitType[] = [
  'apple', 'banana', 'cherry', 'grape',
  'lemon', 'orange', 'strawberry', 'watermelon',
  'mango', 'kiwi',
]

const DIFFICULTY_FRUIT_COUNT: Record<Difficulty, number> = {
  easy: 6,
  normal: 8,
  hard: 10,
}

const DIFFICULTY_GRID_COLS: Record<Difficulty, number> = {
  easy: 3,
  normal: 4,
  hard: 5,
}

// Fisher-Yates 셔플
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * 클라이언트 사이드 게임 생성 폴백 (백엔드 없는 환경용)
 */
function generateLocalGame(difficulty: Difficulty): {
  gameId: string
  difficulty: Difficulty
  gridCols: number
  cards: Card[]
} {
  const fruitCount = DIFFICULTY_FRUIT_COUNT[difficulty]
  const selectedFruits = ALL_FRUIT_TYPES.slice(0, fruitCount)
  const rawCards = selectedFruits.flatMap((type) => [
    { id: crypto.randomUUID(), type, imgUrl: `/images/${type}.png` },
    { id: crypto.randomUUID(), type, imgUrl: `/images/${type}.png` },
  ])
  const cards: Card[] = shuffleArray(rawCards).map((card) => ({
    ...card,
    isFlipped: false,
    isSolved: false,
  }))
  return {
    gameId: crypto.randomUUID(),
    difficulty,
    gridCols: DIFFICULTY_GRID_COLS[difficulty],
    cards,
  }
}

/**
 * Start a new game
 * GET /api/game/start?difficulty=easy|normal|hard
 *
 * @param difficulty - 게임 난이도 (기본: 'normal')
 * @returns { gameId, difficulty, gridCols, cards }
 */
export async function startGame(difficulty: Difficulty = 'normal'): Promise<{
  gameId: string
  difficulty: Difficulty
  gridCols: number
  cards: Card[]
}> {
  try {
    const response = await axios.get<GameStartResponse>(
      `/api/game/start?difficulty=${difficulty}`
    )

    const cards: Card[] = response.data.cards.map((card) => ({
      ...card,
      isFlipped: false,
      isSolved: false,
    }))

    return {
      gameId: response.data.gameId,
      difficulty: response.data.difficulty,
      gridCols: response.data.gridCols,
      cards,
    }
  } catch (error) {
    // 백엔드 없는 환경에서 클라이언트 폴백
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 404 || !error.response)
    ) {
      console.warn('[API Fallback] Backend unavailable, generating game locally')
      return generateLocalGame(difficulty)
    }

    console.error('[API Error] Failed to start game:', error)
    throw new Error('게임 시작에 실패했습니다')
  }
}
