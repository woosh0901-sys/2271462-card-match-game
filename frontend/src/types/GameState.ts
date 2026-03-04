import type { Card } from './Card';

/**
 * Game Status Type
 * 게임의 현재 상태를 나타내는 타입
 */
export type GameStatus = 'IDLE' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';

/**
 * Game State Interface
 * 게임의 전체 상태를 관리하는 인터페이스
 */
export interface GameState {
  /** 게임 ID (서버에서 생성) */
  gameId: string | null;

  /** 16개의 카드 배열 (4x4 그리드) */
  cards: Card[];

  /** 현재 뒤집힌 카드들 (최대 2개) */
  flippedCards: Card[];

  /** 남은 생명 (기회) */
  life: number;

  /** 게임 현재 상태 */
  status: GameStatus;

  /** 로딩 상태 */
  isLoading: boolean;

  /** 에러 메시지 */
  error: string | null;

  /** 매칭 판별 중 여부 */
  isMatching: boolean;
}

/**
 * Game Action Types
 * Reducer에서 사용할 액션 타입들
 */
export type GameAction =
  | { type: 'INIT_GAME'; payload: { gameId: string; cards: Card[] } }
  | { type: 'FLIP_CARD'; payload: { cardId: string } }
  | { type: 'MATCH_SUCCESS'; payload: { cardIds: [string, string] } }
  | { type: 'MATCH_FAIL'; payload: { cardIds: [string, string] } }
  | { type: 'GAME_OVER' }
  | { type: 'VICTORY' }
  | { type: 'RESET_GAME' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_MATCHING'; payload: boolean };
