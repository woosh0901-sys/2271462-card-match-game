/**
 * Card Type Definition
 * 프론트엔드에서 사용하는 카드 인터페이스
 */
export interface Card {
  /** 카드 고유 ID (UUID) */
  id: string;

  /** 과일 타입 (apple, banana, cherry, etc.) */
  type: string;

  /** 이미지 URL */
  imgUrl: string;

  /** 카드가 뒤집혔는지 여부 */
  isFlipped: boolean;

  /** 카드 짝이 맞춰졌는지 여부 */
  isSolved: boolean;
}

/**
 * Fruit Types
 * 게임에서 사용하는 과일 타입들
 */
export type FruitType =
  | 'apple'
  | 'banana'
  | 'cherry'
  | 'grape'
  | 'lemon'
  | 'orange'
  | 'strawberry'
  | 'watermelon';
