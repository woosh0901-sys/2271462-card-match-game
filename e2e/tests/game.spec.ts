import { test, expect } from '@playwright/test'

/**
 * 카드 매칭 게임 E2E 테스트
 *
 * 이슈 #93 AC 기반 3개 시나리오:
 *  1. 게임 페이지 접속 여부 확인
 *  2. 카드 클릭 시 뒤집힘(Flip) 확인
 *  3. 카드 매칭 성공/실패 상태 변화 검증 (실패 → 생명 감소 / 재시작 → 초기화)
 *
 * 교육적 관점 (Testing Strategy):
 * CSS 클래스·텍스트 대신 data-testid 셀렉터를 사용하면
 * 스타일 변경·국제화(i18n)에 테스트가 영향을 받지 않는다.
 */

test.describe('카드 매칭 게임', () => {
  /**
   * AC1: 게임 페이지 접속 여부 확인
   * - 카드 16장 렌더링 + data-testid="game-board" 노출
   * - 생명 3/3 초기값
   * - 모든 카드 뒤집히지 않은 상태
   */
  test('게임 로딩 — 카드 16장이 렌더링된다', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('game-board')).toBeVisible()
    await expect(page.getByTestId('life-display')).toHaveText('남은 기회: 3/3')

    const cards = page.locator('[data-testid^="card-"]')
    await expect(cards).toHaveCount(16)

    const flippedCards = page.locator('[data-is-flipped="true"]')
    await expect(flippedCards).toHaveCount(0)
  })

  /**
   * AC2: 카드 클릭 시 뒤집힘(Flip) 확인
   * - 클릭 후 data-is-flipped="true" 속성 변화
   */
  test('카드 뒤집기 — 클릭하면 data-is-flipped가 true가 된다', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('game-board')).toBeVisible()

    const firstCard = page.locator('[data-testid^="card-"]').first()
    await firstCard.click()

    await expect(firstCard).toHaveAttribute('data-is-flipped', 'true')
  })

  /**
   * AC3-A: 매칭 실패 → 생명 감소 검증
   * - 서로 다른 타입 2장 클릭
   * - 1초(게임 로직) + 여유 시간 후 카드 원복
   * - 생명 3 → 2 감소
   */
  test('매칭 실패 — 다른 타입 카드 클릭 시 생명이 감소한다', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('game-board')).toBeVisible()

    const firstCard = page.locator('[data-testid^="card-"]').first()
    await firstCard.click()
    await expect(firstCard).toHaveAttribute('data-is-flipped', 'true')

    const firstType = await firstCard.getAttribute('data-card-type')

    const differentCard = page
      .locator(`[data-testid^="card-"]:not([data-card-type="${firstType}"])`)
      .first()
    await differentCard.click()

    // 게임 로직: 1000ms 후 MATCH_FAIL 디스패치
    await page.waitForTimeout(2000)

    await expect(page.locator('[data-is-flipped="true"]')).toHaveCount(0)
    await expect(page.getByTestId('life-display')).toHaveText('남은 기회: 2/3')
  })

  /**
   * AC3-B: 게임 재시작 → 상태 초기화 검증
   * - 3회 매칭 실패 → 게임 오버 → ResultModal 노출
   * - 재시작 버튼 클릭 → 생명 3/3 초기화, 카드 16장 재렌더링
   */
  test('게임 재시작 — 재시작 버튼 클릭 시 상태가 초기화된다', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('game-board')).toBeVisible()

    // 3회 매칭 실패로 게임 오버 유도
    for (let i = 0; i < 3; i++) {
      // data-testid를 먼저 캡처하여 고정 로케이터 생성
      // (Playwright locator는 평가 시점마다 재조회되므로 클릭 후 속성 변화로 이동 방지)
      const firstTestId = await page
        .locator('[data-testid^="card-"][data-is-flipped="false"]')
        .first()
        .getAttribute('data-testid')
      const firstCard = page.locator(`[data-testid="${firstTestId}"]`)
      await firstCard.click()
      await expect(firstCard).toHaveAttribute('data-is-flipped', 'true')
      const firstType = await firstCard.getAttribute('data-card-type')

      const differentCard = page
        .locator(`[data-testid^="card-"][data-is-flipped="false"]:not([data-card-type="${firstType}"])`)
        .first()
      await differentCard.click()

      await page.waitForTimeout(1500)
    }

    // ResultModal 표시 확인
    await expect(page.getByTestId('result-modal')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('modal-title')).toHaveText('게임 오버')

    // 재시작
    await page.getByTestId('restart-button').click()

    // 상태 초기화 확인
    await expect(page.getByTestId('life-display')).toHaveText('남은 기회: 3/3', { timeout: 10000 })
    await expect(page.locator('[data-testid^="card-"]')).toHaveCount(16)
  })
})
