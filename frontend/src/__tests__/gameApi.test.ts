import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import type { AxiosError } from 'axios'
import { startGame } from '../api/gameApi'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

// axios.isAxiosError는 타입 가드(type predicate) 함수이므로
// mockImplementation으로 타입을 명시하여 TypeScript 오류를 방지한다.
const mockIsAxiosError = (returnValue: boolean) =>
  vi.mocked(axios.isAxiosError).mockImplementation(
    (_err): _err is AxiosError => returnValue,
  )

// ─── 정상 응답 ─────────────────────────────────────────────────────────────────
describe('startGame — 백엔드 정상 응답', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('서버 응답을 Card 배열로 변환하여 반환한다', async () => {
    const serverCards = Array.from({ length: 16 }, (_, i) => ({
      id: `server-id-${i}`,
      type: 'apple',
      imgUrl: '/images/apple.png',
    }))
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: { gameId: 'server-game-id', cards: serverCards },
    })

    const { gameId, cards } = await startGame()

    expect(gameId).toBe('server-game-id')
    expect(cards).toHaveLength(16)
    // isFlipped / isSolved 초기값 추가 여부 확인
    expect(cards[0].isFlipped).toBe(false)
    expect(cards[0].isSolved).toBe(false)
  })
})

// ─── 폴백: 404 ────────────────────────────────────────────────────────────────
describe('startGame — 백엔드 404 (GitHub Pages 환경)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('404 응답 시 로컬에서 16장 카드를 생성하여 반환한다', async () => {
    const axiosError = Object.assign(new Error('404'), {
      isAxiosError: true,
      response: { status: 404 },
      request: {},
    })
    mockedAxios.get = vi.fn().mockRejectedValue(axiosError)
    mockIsAxiosError(true)

    const { gameId, cards } = await startGame()

    expect(gameId).toBeTruthy()
    expect(cards).toHaveLength(16)
    expect(cards[0].isFlipped).toBe(false)
    expect(cards[0].isSolved).toBe(false)
  })

  it('폴백 시 8가지 과일이 각 2장씩 포함된다', async () => {
    const axiosError = Object.assign(new Error('404'), {
      isAxiosError: true,
      response: { status: 404 },
      request: {},
    })
    mockedAxios.get = vi.fn().mockRejectedValue(axiosError)
    mockIsAxiosError(true)

    const { cards } = await startGame()

    const typeCounts: Record<string, number> = {}
    cards.forEach((card) => {
      typeCounts[card.type] = (typeCounts[card.type] ?? 0) + 1
    })

    // 8가지 과일 타입이 존재해야 한다
    expect(Object.keys(typeCounts)).toHaveLength(8)
    // 각 타입은 정확히 2장이어야 한다
    Object.values(typeCounts).forEach((count) => {
      expect(count).toBe(2)
    })
  })
})

// ─── 폴백: 네트워크 오류 ──────────────────────────────────────────────────────
describe('startGame — 네트워크 오류 (서버 응답 없음)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('네트워크 오류(응답 없음) 시 로컬 폴백으로 게임을 생성한다', async () => {
    const networkError = Object.assign(new Error('Network Error'), {
      isAxiosError: true,
      response: undefined,
      request: {},
    })
    mockedAxios.get = vi.fn().mockRejectedValue(networkError)
    mockIsAxiosError(true)

    const { gameId, cards } = await startGame()

    expect(gameId).toBeTruthy()
    expect(cards).toHaveLength(16)
  })
})
