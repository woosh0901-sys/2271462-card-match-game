import type { FruitType } from '../types/Card'

/**
 * Fruit Emoji Mapping
 * 각 과일 타입에 대응하는 emoji
 *
 * 이미지가 없는 경우 emoji를 대안으로 사용
 * 향후 실제 이미지로 교체 가능
 */
export const FRUIT_EMOJIS: Record<FruitType, string> = {
  apple: '🍎',
  banana: '🍌',
  cherry: '🍒',
  grape: '🍇',
  lemon: '🍋',
  orange: '🍊',
  strawberry: '🍓',
  watermelon: '🍉',
}

/**
 * Get Fruit Emoji
 * 과일 타입에 해당하는 emoji를 반환
 *
 * @param fruitType - 과일 타입
 * @returns emoji 문자열
 *
 * @example
 * getFruitEmoji('apple') // '🍎'
 */
export function getFruitEmoji(fruitType: string): string {
  return FRUIT_EMOJIS[fruitType as FruitType] || '❓'
}

/**
 * Preload Emojis (No-op for emojis)
 * Emoji는 preload가 필요 없지만, 향후 이미지로 전환할 때를 대비한 인터페이스
 *
 * @returns Promise that resolves immediately
 *
 * @example
 * await preloadFruitAssets()
 */
export async function preloadFruitAssets(): Promise<void> {
  // Emoji는 preload가 필요 없음
  // 향후 실제 이미지를 사용할 경우 아래와 같이 구현:
  /*
  const imageUrls = Object.values(FRUIT_IMAGES)
  const promises = imageUrls.map((url) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.src = url
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    })
  })
  await Promise.all(promises)
  */

  // Emoji 사용 시 즉시 완료
  return Promise.resolve()
}
