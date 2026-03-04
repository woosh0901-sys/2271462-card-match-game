import { shuffle } from '../../utils/shuffle';

describe('Fisher-Yates Shuffle Algorithm', () => {
  test('should maintain array length', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = shuffle(original);

    expect(shuffled).toHaveLength(original.length);
  });

  test('should contain all original elements', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = shuffle(original);

    // Check that all original elements are present
    original.forEach((element) => {
      expect(shuffled).toContain(element);
    });
  });

  test('should not mutate original array', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const originalCopy = [...original];
    shuffle(original);

    expect(original).toEqual(originalCopy);
  });

  test('should produce different orders on multiple runs', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = new Set<string>();

    // Run shuffle 10 times and collect results
    for (let i = 0; i < 10; i++) {
      const shuffled = shuffle(original);
      results.add(JSON.stringify(shuffled));
    }

    // With 10 elements, the probability of getting the same order twice is extremely low
    // We expect at least 2 different orders out of 10 runs
    expect(results.size).toBeGreaterThan(1);
  });

  test('should handle empty array', () => {
    const original: number[] = [];
    const shuffled = shuffle(original);

    expect(shuffled).toEqual([]);
  });

  test('should handle single element array', () => {
    const original = [42];
    const shuffled = shuffle(original);

    expect(shuffled).toEqual([42]);
  });
});
