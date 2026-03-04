import axios from 'axios'
import type { Card, FruitType } from '../types/Card'

/**
 * API Response for /api/game/start
 * 백엔드에서 반환하는 게임 시작 응답 타입
 */
interface GameStartResponse {
  gameId: string
  cards: Array<{
    id: string
    type: string
    imgUrl: string
  }>
}

// 8가지 과일 타입 (백엔드 FRUIT_TYPES와 동일)
const FRUIT_TYPES: FruitType[] = [
  'apple', 'banana', 'cherry', 'grape',
  'lemon', 'orange', 'strawberry', 'watermelon',
]

// Fisher-Yates 셔플 (백엔드 shuffle.ts와 동일 알고리즘)
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * 클라이언트 사이드 게임 생성 (GitHub Pages 등 백엔드 없는 환경용 폴백)
 * 백엔드 generateCards() + shuffle() 로직을 브라우저에서 동일하게 실행한다.
 */
function generateLocalGame(): { gameId: string; cards: Card[] } {
  const rawCards = FRUIT_TYPES.flatMap((type) => [
    { id: crypto.randomUUID(), type, imgUrl: `/images/${type}.png` },
    { id: crypto.randomUUID(), type, imgUrl: `/images/${type}.png` },
  ])
  const cards: Card[] = shuffleArray(rawCards).map((card) => ({
    ...card,
    isFlipped: false,
    isSolved: false,
  }))
  return { gameId: crypto.randomUUID(), cards }
}

/**
 * Start a new game
 * /api/game/start 엔드포인트를 호출하여 새 게임을 시작합니다.
 * 백엔드를 사용할 수 없는 환경(GitHub Pages 등)에서는 클라이언트 사이드 폴백으로 게임을 생성합니다.
 *
 * @returns Promise<{ gameId: string; cards: Card[] }>
 *
 * @example
 * const { gameId, cards } = await startGame()
 */
export async function startGame(): Promise<{ gameId: string; cards: Card[] }> {
  try {
    const response = await axios.get<GameStartResponse>('/api/game/start')

    // 백엔드 응답을 프론트엔드 Card 타입으로 변환
    // isFlipped와 isSolved 필드를 추가 (초기값: false)
    const cards: Card[] = response.data.cards.map((card) => ({
      ...card,
      isFlipped: false,
      isSolved: false,
    }))

    return {
      gameId: response.data.gameId,
      cards,
    }
  } catch (error) {
    // 백엔드를 사용할 수 없는 환경(GitHub Pages, 오프라인 등)에서 클라이언트 사이드로 게임 생성
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 404 || !error.response)
    ) {
      console.warn('[API Fallback] Backend unavailable, generating game locally')
      return generateLocalGame()
    }

    console.error('[API Error] Failed to start game:', error)
    throw new Error('게임 시작에 실패했습니다')
  }
}
