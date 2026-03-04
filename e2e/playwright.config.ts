import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E 설정
 *
 * 실행 환경별 동작 분기:
 *
 *  1. 로컬 개발 환경 (PLAYWRIGHT_BASE_URL 미설정):
 *     - baseURL: http://localhost:4173
 *     - webServer: backend(3001) + frontend(4173) 자동 기동
 *     - reuseExistingServer: true (이미 실행 중인 서버 재사용)
 *
 *  2. CD 파이프라인 스테이징 환경 (PLAYWRIGHT_BASE_URL 설정됨):
 *     - baseURL: PLAYWRIGHT_BASE_URL (스테이징 서버 URL)
 *     - webServer: 생략 (스테이징 서버가 이미 실행 중이므로 불필요)
 *
 * 교육적 관점 (환경 분리 원칙):
 * 테스트 환경 전환 시 코드 수정 없이 환경변수만으로 동작을 변경한다.
 * 비유: 영업사원이 같은 프레젠테이션을 국내/해외 고객에게 언어만 바꿔 사용하는 것과 같다.
 */

// PLAYWRIGHT_BASE_URL 이 설정된 경우 스테이징 환경으로 판단한다
const isStaging = !!process.env.PLAYWRIGHT_BASE_URL
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173'

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  workers: process.env.CI ? 1 : undefined,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 스테이징 환경에서는 서버가 이미 실행 중이므로 webServer 기동을 생략한다.
  // 로컬 환경에서는 기존 방식대로 백엔드와 프론트엔드를 자동으로 기동한다.
  ...(isStaging
    ? {}
    : {
        webServer: [
          {
            command: 'npm run dev',
            cwd: '../backend',
            port: 3001,
            reuseExistingServer: !process.env.CI,
            timeout: 30_000,
          },
          {
            command: 'npm run build && npm run preview',
            cwd: '../frontend',
            port: 4173,
            reuseExistingServer: !process.env.CI,
            timeout: 60_000,
          },
        ],
      }),
})
