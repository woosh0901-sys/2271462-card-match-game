import { randomUUID } from 'crypto';
import { Card, FRUIT_TYPES } from '../types/Card';
import { shuffle } from './shuffle';

/**
 * Generate 16 cards (8 types x 2 cards each) and shuffle them
 *
 * @returns Array of 16 shuffled Card objects
 */
export function generateCards(): Card[] {
  const cards: Card[] = [];

  // Create 2 cards for each fruit type (8 types x 2 = 16 cards)
  FRUIT_TYPES.forEach((fruitType) => {
    for (let i = 0; i < 2; i++) {
      cards.push({
        id: randomUUID(),
        type: fruitType,
        imgUrl: `/images/${fruitType}.png`,
      });
    }
  });

  // Shuffle the cards using Fisher-Yates algorithm
  return shuffle(cards);
}
