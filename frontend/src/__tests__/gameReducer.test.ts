import { gameReducer, initialState } from '../contexts/GameContext'
import type { Card } from '../types/Card'

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────
const makeCard = (id: string, type: string, overrides: Partial<Card> = {}): Card => ({
  id,
  type,
  imgUrl: `/images/${type}.png`,
  isFlipped: false,
  isSolved: false,
  ...overrides,
})

// ─── INIT_GAME ────────────────────────────────────────────────────────────────
describe('INIT_GAME', () => {
  it('status를 PLAYING으로, life를 3으로 초기화한다', () => {
    const cards = [makeCard('c1', 'apple'), makeCard('c2', 'apple')]
    const next = gameReducer(initialState, {
      type: 'INIT_GAME',
      payload: { gameId: 'game-1', cards },
    })
    expect(next.status).toBe('PLAYING')
    expect(next.life).toBe(3)
    expect(next.gameId).toBe('game-1')
    expect(next.cards).toHaveLength(2)
    expect(next.flippedCards).toHaveLength(0)
    expect(next.isLoading).toBe(false)
    expect(next.error).toBeNull()
  })

  it('불변성: 원본 state 객체가 변경되지 않는다', () => {
    const frozen = Object.freeze({ ...initialState })
    expect(() =>
      gameReducer(frozen, {
        type: 'INIT_GAME',
        payload: { gameId: 'x', cards: [] },
      })
    ).not.toThrow()
  })
})

// ─── FLIP_CARD ────────────────────────────────────────────────────────────────
describe('FLIP_CARD', () => {
  it('해당 카드의 isFlipped를 true로, flippedCards에 추가한다', () => {
    const cards = [makeCard('c1', 'apple'), makeCard('c2', 'banana')]
    const state = { ...initialState, cards }
    const next = gameReducer(state, { type: 'FLIP_CARD', payload: { cardId: 'c1' } })

    const flipped = next.cards.find((c) => c.id === 'c1')
    expect(flipped?.isFlipped).toBe(true)
    expect(next.flippedCards).toHaveLength(1)
    expect(next.flippedCards[0].id).toBe('c1')
  })

  it('다른 카드의 isFlipped는 변경하지 않는다', () => {
    const cards = [makeCard('c1', 'apple'), makeCard('c2', 'banana')]
    const state = { ...initialState, cards }
    const next = gameReducer(state, { type: 'FLIP_CARD', payload: { cardId: 'c1' } })

    const untouched = next.cards.find((c) => c.id === 'c2')
    expect(untouched?.isFlipped).toBe(false)
  })
})

// ─── MATCH_SUCCESS ────────────────────────────────────────────────────────────
describe('MATCH_SUCCESS', () => {
  it('두 카드의 isSolved를 true로 변경하고 flippedCards를 비운다', () => {
    const cards = [
      makeCard('c1', 'apple', { isFlipped: true }),
      makeCard('c2', 'apple', { isFlipped: true }),
    ]
    const state = {
      ...initialState,
      cards,
      flippedCards: [cards[0], cards[1]],
    }
    const next = gameReducer(state, {
      type: 'MATCH_SUCCESS',
      payload: { cardIds: ['c1', 'c2'] },
    })

    expect(next.cards.find((c) => c.id === 'c1')?.isSolved).toBe(true)
    expect(next.cards.find((c) => c.id === 'c2')?.isSolved).toBe(true)
    expect(next.flippedCards).toHaveLength(0)
  })
})

// ─── MATCH_FAIL ───────────────────────────────────────────────────────────────
describe('MATCH_FAIL', () => {
  it('두 카드의 isFlipped를 false로 변경하고 life를 1 감소시킨다', () => {
    const cards = [
      makeCard('c1', 'apple', { isFlipped: true }),
      makeCard('c2', 'banana', { isFlipped: true }),
    ]
    const state = {
      ...initialState,
      life: 3,
      cards,
      flippedCards: [cards[0], cards[1]],
    }
    const next = gameReducer(state, {
      type: 'MATCH_FAIL',
      payload: { cardIds: ['c1', 'c2'] },
    })

    expect(next.life).toBe(2)
    expect(next.cards.find((c) => c.id === 'c1')?.isFlipped).toBe(false)
    expect(next.cards.find((c) => c.id === 'c2')?.isFlipped).toBe(false)
    expect(next.flippedCards).toHaveLength(0)
  })
})

// ─── GAME_OVER ────────────────────────────────────────────────────────────────
describe('GAME_OVER', () => {
  it('status를 GAME_OVER로 변경한다', () => {
    const state = { ...initialState, status: 'PLAYING' as const }
    const next = gameReducer(state, { type: 'GAME_OVER' })
    expect(next.status).toBe('GAME_OVER')
  })
})

// ─── VICTORY ─────────────────────────────────────────────────────────────────
describe('VICTORY', () => {
  it('status를 VICTORY로 변경한다', () => {
    const state = { ...initialState, status: 'PLAYING' as const }
    const next = gameReducer(state, { type: 'VICTORY' })
    expect(next.status).toBe('VICTORY')
  })
})

// ─── RESET_GAME ───────────────────────────────────────────────────────────────
describe('RESET_GAME', () => {
  it('상태를 초기값으로 되돌린다', () => {
    const state = {
      ...initialState,
      life: 1,
      status: 'GAME_OVER' as const,
      gameId: 'old-game',
    }
    const next = gameReducer(state, { type: 'RESET_GAME' })
    expect(next).toEqual(initialState)
  })
})

// ─── SET_LOADING ──────────────────────────────────────────────────────────────
describe('SET_LOADING', () => {
  it('isLoading을 true로 설정한다', () => {
    const next = gameReducer(initialState, { type: 'SET_LOADING', payload: true })
    expect(next.isLoading).toBe(true)
  })

  it('isLoading을 false로 설정한다', () => {
    const state = { ...initialState, isLoading: true }
    const next = gameReducer(state, { type: 'SET_LOADING', payload: false })
    expect(next.isLoading).toBe(false)
  })
})

// ─── SET_ERROR ────────────────────────────────────────────────────────────────
describe('SET_ERROR', () => {
  it('에러 메시지를 설정하고 isLoading을 false로 만든다', () => {
    const state = { ...initialState, isLoading: true }
    const next = gameReducer(state, { type: 'SET_ERROR', payload: '서버 오류' })
    expect(next.error).toBe('서버 오류')
    expect(next.isLoading).toBe(false)
  })
})

// ─── SET_MATCHING ─────────────────────────────────────────────────────────────
describe('SET_MATCHING', () => {
  it('isMatching을 true로 설정한다', () => {
    const next = gameReducer(initialState, { type: 'SET_MATCHING', payload: true })
    expect(next.isMatching).toBe(true)
  })

  it('isMatching을 false로 설정한다', () => {
    const state = { ...initialState, isMatching: true }
    const next = gameReducer(state, { type: 'SET_MATCHING', payload: false })
    expect(next.isMatching).toBe(false)
  })
})
