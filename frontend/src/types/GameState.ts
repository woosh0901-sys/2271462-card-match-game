import type { Card, Difficulty } from './Card';

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

  /** 카드 배열 */
  cards: Card[];

  /** 현재 뒤집힌 카드들 (최대 2개) */
  flippedCards: Card[];

  /** 낙은 생명 (기회) */
  life: number;

  /** 게임 현재 상태 */
  status: GameStatus;

  /** 로딩 상태 */
  isLoading: boolean;

  /** 에러 메시지 */
  error: string | null;

  /** 매칭 판별 중 여부 */
  isMatching: boolean;

  // ─── 신규 필드 ────────────────────────────────────────────

  /** 현재 점수 */
  score: number;

  /** 현재 콤보 수 (연속 매칭 성공 횟수) */
  combo: number;

  /** 최대 콤보 */
  maxCombo: number;

  /** 경과 시간 (초) */
  elapsedTime: number;

  /** 선택한 난이도 */
  difficulty: Difficulty;

  /** 그리드 열 수 (Easy: 3, Normal: 4, Hard: 5) */
  gridCols: number;

  /** 힌트 사용 여부 (게임당 1회만 혁용) */
  hintUsed: boolean;

  /** 힌트 활성화 중 여부 (힌트 애니메이션 진행 중) */
  isHinting: boolean;

  /** 일시 중지 여부 (ESC 키 설정창) */
  isPaused: boolean;
}

/**
 * Game Action Types
 * Reducer에서 사용할 액션 타입들
 */
export type GameAction =
  | { type: 'INIT_GAME'; payload: { gameId: string; cards: Card[]; difficulty: Difficulty; gridCols: number } }
  | { type: 'FLIP_CARD'; payload: { cardId: string } }
  | { type: 'MATCH_SUCCESS'; payload: { cardIds: [string, string] } }
  | { type: 'MATCH_FAIL'; payload: { cardIds: [string, string] } }
  | { type: 'GAME_OVER' }
  | { type: 'VICTORY' }
  | { type: 'RESET_GAME' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_MATCHING'; payload: boolean }
  | { type: 'SET_DIFFICULTY'; payload: { difficulty: Difficulty; gridCols: number } }
  | { type: 'TICK_TIMER' }
  | { type: 'USE_HINT' }
  | { type: 'SET_HINTING'; payload: boolean }
  | { type: 'SET_PAUSE'; payload: boolean };

