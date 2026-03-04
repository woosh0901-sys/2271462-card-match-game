import { generateCards } from '../../utils/generateCards';
import { DIFFICULTY_CONFIG } from '../../types/Card';

describe('generateCards Function', () => {
  describe('normal difficulty (default)', () => {
    test('should generate exactly 16 cards', () => {
      const cards = generateCards('normal');
      expect(cards).toHaveLength(16);
    });

    test('should have 8 different fruit types', () => {
      const cards = generateCards('normal');
      const types = new Set(cards.map((card) => card.type));
      expect(types.size).toBe(8);
    });

    test('should have exactly 2 cards of each type', () => {
      const cards = generateCards('normal');
      const types = new Set(cards.map((card) => card.type));
      types.forEach((type) => {
        const count = cards.filter((card) => card.type === type).length;
        expect(count).toBe(2);
      });
    });

    test('should have unique IDs for all cards', () => {
      const cards = generateCards('normal');
      const ids = cards.map((card) => card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(16);
    });
  });

  describe('easy difficulty', () => {
    test('should generate exactly 12 cards', () => {
      const cards = generateCards('easy');
      expect(cards).toHaveLength(DIFFICULTY_CONFIG.easy.cardCount);
    });

    test('should have 6 different fruit types', () => {
      const cards = generateCards('easy');
      const types = new Set(cards.map((card) => card.type));
      expect(types.size).toBe(DIFFICULTY_CONFIG.easy.fruitCount);
    });
  });

  describe('hard difficulty', () => {
    test('should generate exactly 20 cards', () => {
      const cards = generateCards('hard');
      expect(cards).toHaveLength(DIFFICULTY_CONFIG.hard.cardCount);
    });

    test('should have 10 different fruit types', () => {
      const cards = generateCards('hard');
      const types = new Set(cards.map((card) => card.type));
      expect(types.size).toBe(DIFFICULTY_CONFIG.hard.fruitCount);
    });
  });

  test('should have correct imgUrl format', () => {
    const cards = generateCards('normal');
    cards.forEach((card) => {
      expect(card.imgUrl).toMatch(/^\/images\/[a-z]+\.png$/);
      expect(card.imgUrl).toBe(`/images/${card.type}.png`);
    });
  });

  test('should have all required properties', () => {
    const cards = generateCards('normal');
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
    for (let i = 0; i < 5; i++) {
      const cards = generateCards('normal');
      const order = cards.map((card) => card.type).join(',');
      results.add(order);
    }
    expect(results.size).toBeGreaterThan(1);
  });
});
