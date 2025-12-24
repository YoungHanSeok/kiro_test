import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 설정 파일
 * E2E 테스트를 위한 브라우저 및 서버 설정
 */
export default defineConfig({
  testDir: './src/e2e',
  /* 병렬 실행 */
  fullyParallel: true,
  /* CI에서 실패 시 재시도 금지 */
  forbidOnly: !!process.env.CI,
  /* CI에서 재시도 설정 */
  retries: process.env.CI ? 2 : 0,
  /* 병렬 워커 수 */
  workers: process.env.CI ? 1 : undefined,
  /* 리포터 설정 */
  reporter: 'html',
  /* 모든 테스트에 공통 설정 */
  use: {
    /* 실패 시 스크린샷 */
    screenshot: 'only-on-failure',
    /* 실패 시 비디오 */
    video: 'retain-on-failure',
    /* 베이스 URL */
    baseURL: 'http://localhost:5173',
  },

  /* 다양한 브라우저에서 테스트 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* 테스트 실행 전 개발 서버 시작 */
  webServer: [
    {
      command: 'npm run dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'cd ../backend && npm run dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});