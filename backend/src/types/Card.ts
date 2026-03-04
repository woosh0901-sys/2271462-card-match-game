export interface Card {
  id: string;
  type: string;
  imgUrl: string;
}

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

export const FRUIT_TYPES: FruitType[] = [
  'apple',
  'banana',
  'cherry',
  'grape',
  'lemon',
  'orange',
  'strawberry',
  'watermelon',
  'mango',
  'kiwi',
];

export type Difficulty = 'easy' | 'normal' | 'hard';

/** 난이도별 설정 */
export const DIFFICULTY_CONFIG: Record<Difficulty, { fruitCount: number; gridCols: number; cardCount: number }> = {
  easy:   { fruitCount: 6,  gridCols: 3, cardCount: 12 },
  normal: { fruitCount: 8,  gridCols: 4, cardCount: 16 },
  hard:   { fruitCount: 10, gridCols: 5, cardCount: 20 },
};
