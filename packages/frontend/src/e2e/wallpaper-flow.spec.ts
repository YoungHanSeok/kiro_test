import { test, expect } from '@playwright/test';

/**
 * 배경화면 탐색 → 상세 보기 → 다운로드 플로우 E2E 테스트
 * 요구사항: 1.2, 2.2
 */
test.describe('배경화면 탐색 및 다운로드 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 홈페이지로 이동
    await page.goto('/');
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
  });

  test('사용자가 테마를 선택하고 배경화면을 탐색할 수 있다', async ({ page }) => {
    // 테마 선택기가 표시되는지 확인
    await expect(page.locator('[data-testid="theme-selector"]')).toBeVisible();
    
    // 첫 번째 테마 클릭
    const firstTheme = page.locator('[data-testid="theme-item"]').first();
    await expect(firstTheme).toBeVisible();
    await firstTheme.click();
    
    // 테마별 배경화면 목록이 표시되는지 확인
    await expect(page.locator('[data-testid="wallpaper-grid"]')).toBeVisible();
    
    // 배경화면 카드들이 표시되는지 확인
    const wallpaperCards = page.locator('[data-testid="wallpaper-card"]');
    await expect(wallpaperCards.first()).toBeVisible();
    
    // 각 배경화면 카드에 필수 정보가 포함되어 있는지 확인
    const firstCard = wallpaperCards.first();
    await expect(firstCard.locator('[data-testid="wallpaper-thumbnail"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="wallpaper-title"]')).toBeVisible();
  });

  test('사용자가 배경화면 상세 페이지에서 다운로드할 수 있다', async ({ page }) => {
    // 첫 번째 배경화면 카드 클릭
    const firstWallpaper = page.locator('[data-testid="wallpaper-card"]').first();
    await expect(firstWallpaper).toBeVisible();
    await firstWallpaper.click();
    
    // 상세 페이지로 이동했는지 확인
    await expect(page).toHaveURL(/\/wallpaper\/\w+/);
    
    // 상세 페이지 요소들이 표시되는지 확인
    await expect(page.locator('[data-testid="wallpaper-detail-image"]')).toBeVisible();
    await expect(page.locator('[data-testid="wallpaper-detail-title"]')).toBeVisible();
    
    // 다운로드 버튼 클릭
    const downloadButton = page.locator('[data-testid="download-button"]');
    await expect(downloadButton).toBeVisible();
    await downloadButton.click();
    
    // 다운로드 모달이 열리는지 확인
    const downloadModal = page.locator('[data-testid="download-modal"]');
    await expect(downloadModal).toBeVisible();
    
    // 해상도 옵션들이 표시되는지 확인
    const resolutionOptions = page.locator('[data-testid="resolution-option"]');
    await expect(resolutionOptions.first()).toBeVisible();
    
    // 첫 번째 해상도 선택 및 다운로드
    await resolutionOptions.first().click();
    
    // 다운로드 진행 상태가 표시되는지 확인
    await expect(page.locator('[data-testid="download-progress"]')).toBeVisible();
  });

  test('사용자가 배경화면에 좋아요를 표시할 수 있다', async ({ page }) => {
    // 첫 번째 배경화면 카드의 좋아요 버튼 클릭
    const firstCard = page.locator('[data-testid="wallpaper-card"]').first();
    const likeButton = firstCard.locator('[data-testid="like-button"]');
    
    await expect(likeButton).toBeVisible();
    
    // 좋아요 상태 확인 (초기에는 좋아요 안 됨)
    await expect(likeButton).not.toHaveClass(/liked/);
    
    // 좋아요 버튼 클릭
    await likeButton.click();
    
    // 좋아요 상태가 변경되었는지 확인
    await expect(likeButton).toHaveClass(/liked/);
    
    // 좋아요 다시 클릭하여 취소
    await likeButton.click();
    
    // 좋아요 상태가 취소되었는지 확인
    await expect(likeButton).not.toHaveClass(/liked/);
  });
});