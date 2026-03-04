import { generateCards } from '../../utils/generateCards';
import { FRUIT_TYPES } from '../../types/Card';

describe('generateCards Function', () => {
  test('should generate exactly 16 cards', () => {
    const cards = generateCards();

    expect(cards).toHaveLength(16);
  });

  test('should have 8 different fruit types', () => {
    const cards = generateCards();
    const types = new Set(cards.map((card) => card.type));

    expect(types.size).toBe(8);
  });

  test('should have exactly 2 cards of each type', () => {
    const cards = generateCards();

    FRUIT_TYPES.forEach((fruitType) => {
      const count = cards.filter((card) => card.type === fruitType).length;
      expect(count).toBe(2);
    });
  });

  test('should have unique IDs for all cards', () => {
    const cards = generateCards();
    const ids = cards.map((card) => card.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(16);
  });

  test('should have correct imgUrl format', () => {
    const cards = generateCards();

    cards.forEach((card) => {
      expect(card.imgUrl).toMatch(/^\/images\/[a-z]+\.png$/);
      expect(card.imgUrl).toBe(`/images/${card.type}.png`);
    });
  });

  test('should have all required properties', () => {
    const cards = generateCards();

    cards.forEach((card) => {
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('type');
      expect(card).toHaveProperty('imgUrl');
      expect(typeof card.id).toBe('string');
      expect(typeof card.type).toBe('string');
      expect(typeof card.imgUrl).toBe('string');
    });
  });

  test('should shuffle cards (not in predictable order)', () => {
    const results = new Set<string>();

    // Generate cards 5 times and collect results
    for (let i = 0; i < 5; i++) {
      const cards = generateCards();
      const order = cards.map((card) => card.type).join(',');
      results.add(order);
    }

    // With shuffling, we expect different orders
    expect(results.size).toBeGreaterThan(1);
  });
});
