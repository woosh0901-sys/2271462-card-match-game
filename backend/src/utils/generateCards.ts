import { randomUUID } from 'crypto';
import { Card, Difficulty, DIFFICULTY_CONFIG, FRUIT_TYPES } from '../types/Card';
import { shuffle } from './shuffle';

/**
 * Generate cards based on difficulty and shuffle them.
 *
 * | Difficulty | Types | Cards |
 * |------------|-------|-------|
 * | easy       |   6   |  12   |
 * | normal     |   8   |  16   |
 * | hard       |  10   |  20   |
 *
 * @param difficulty - Game difficulty (default: 'normal')
 * @returns Shuffled Card array
 */
export function generateCards(difficulty: Difficulty = 'normal'): Card[] {
  const { fruitCount } = DIFFICULTY_CONFIG[difficulty];
  const selectedFruits = FRUIT_TYPES.slice(0, fruitCount);
  const cards: Card[] = [];

  // 각 과일 타입당 2장씩 생성
  selectedFruits.forEach((fruitType) => {
    for (let i = 0; i < 2; i++) {
      cards.push({
        id: randomUUID(),
        type: fruitType,
        imgUrl: `/images/${fruitType}.png`,
      });
    }
  });

  return shuffle(cards);
}
