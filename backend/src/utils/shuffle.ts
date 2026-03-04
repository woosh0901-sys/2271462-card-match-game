/**
 * Fisher-Yates Shuffle Algorithm
 * Time Complexity: O(n)
 * Space Complexity: O(1) - in-place shuffle
 *
 * @param array - Array to shuffle
 * @returns Shuffled array (mutates original)
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array]; // Create a copy to avoid mutating original

  for (let i = arr.length - 1; i > 0; i--) {
    // Generate random index between 0 and i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at indices i and j
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}
