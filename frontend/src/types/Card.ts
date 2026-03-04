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

  /** 매칭 실패 시 shake 애니메이션 여부 */
  isShaking?: boolean;
}

/**
 * Difficulty Type
 * 게임 난이도
 */
export type Difficulty = 'easy' | 'normal' | 'hard';

/**
 * Fruit Types
 * 게임에서 사용하는 과일 타입들 (Easy: 6종, Normal: 8종, Hard: 10종)
 */
export type FruitType =
  | 'apple'
  | 'banana'
  | 'cherry'
  | 'grape'
  | 'lemon'
  | 'orange'
  | 'strawberry'
  | 'watermelon'
  | 'mango'
  | 'kiwi';

