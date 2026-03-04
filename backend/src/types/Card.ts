export interface Card {
  id: string;
  type: string;
  imgUrl: string;
}

export type FruitType = 'apple' | 'banana' | 'cherry' | 'grape' | 'lemon' | 'orange' | 'strawberry' | 'watermelon';

export const FRUIT_TYPES: FruitType[] = [
  'apple',
  'banana',
  'cherry',
  'grape',
  'lemon',
  'orange',
  'strawberry',
  'watermelon',
];
