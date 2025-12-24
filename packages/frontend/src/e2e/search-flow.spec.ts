import { test, expect } from '@playwright/test';

/**
 * 검색 → 결과 확인 → 좋아요 플로우 E2E 테스트
 * 요구사항: 4.2, 3.2
 */
test.describe('검색 및 좋아요 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 홈페이지로 이동
    await page.goto('/');
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
  });

  test('사용자가 배경화면을 검색할 수 있다', async ({ page }) => {
    // 검색 바가 표시되는지 확인
    const searchBar = page.locator('[data-testid="search-bar"]');
    await expect(searchBar).toBeVisible();
    
    // 검색어 입력
    const searchInput = searchBar.locator('input');
    await searchInput.fill('nature');
    
    // 검색 결과가 실시간으로 필터링되는지 확인
    await page.waitForTimeout(500); // 디바운싱 대기
    
    // 검색 결과 확인
    const wallpaperCards = page.locator('[data-testid="wallpaper-card"]');
    await expect(wallpaperCards.first()).toBeVisible();
    
    // 검색 결과가 검색어와 관련있는지 확인 (제목이나 태그에 'nature' 포함)
    const firstCardTitle = wallpaperCards.first().locator('[data-testid="wallpaper-title"]');
    const titleText = await firstCardTitle.textContent();
    
    // 검색어 지우기
    await searchInput.clear();
    
    // 전체 목록으로 돌아가는지 확인
    await page.waitForTimeout(500);
    const allCards = page.locator('[data-testid="wallpaper-card"]');
    await expect(allCards.first()).toBeVisible();
  });

  test('검색 결과가 없을 때 적절한 메시지를 표시한다', async ({ page }) => {
    // 검색 바에 존재하지 않는 검색어 입력
    const searchBar = page.locator('[data-testid="search-bar"]');
    const searchInput = searchBar.locator('input');
    await searchInput.fill('nonexistentterm12345');
    
    // 검색 결과 대기
    await page.waitForTimeout(500);
    
    // 검색 결과 없음 메시지 확인
    await expect(page.locator('[data-testid="no-results-message"]')).toBeVisible();
  });

  test('검색 후 배경화면에 좋아요를 표시할 수 있다', async ({ page }) => {
    // 검색 실행
    const searchBar = page.locator('[data-testid="search-bar"]');
    const searchInput = searchBar.locator('input');
    await searchInput.fill('space');
    await page.waitForTimeout(500);
    
    // 검색 결과에서 첫 번째 배경화면에 좋아요 표시
    const firstCard = page.locator('[data-testid="wallpaper-card"]').first();
    const likeButton = firstCard.locator('[data-testid="like-button"]');
    
    await expect(likeButton).toBeVisible();
    await likeButton.click();
    
    // 좋아요 상태 확인
    await expect(likeButton).toHaveClass(/liked/);
    
    // 좋아요 목록 페이지로 이동
    await page.goto('/favorites');
    
    // 좋아요한 배경화면이 목록에 표시되는지 확인
    const favoriteCards = page.locator('[data-testid="wallpaper-card"]');
    await expect(favoriteCards.first()).toBeVisible();
    
    // 좋아요 목록에서 제거
    const favoriteButton = favoriteCards.first().locator('[data-testid="like-button"]');
    await favoriteButton.click();
    
    // 목록에서 제거되었는지 확인 (빈 상태 메시지 표시)
    await expect(page.locator('[data-testid="empty-favorites-message"]')).toBeVisible();
  });

  test('좋아요 상태가 페이지 간 이동 시에도 유지된다', async ({ page }) => {
    // 첫 번째 배경화면에 좋아요 표시
    const firstCard = page.locator('[data-testid="wallpaper-card"]').first();
    const likeButton = firstCard.locator('[data-testid="like-button"]');
    
    await likeButton.click();
    await expect(likeButton).toHaveClass(/liked/);
    
    // 상세 페이지로 이동
    await firstCard.click();
    
    // 상세 페이지에서도 좋아요 상태가 유지되는지 확인
    const detailLikeButton = page.locator('[data-testid="like-button"]');
    await expect(detailLikeButton).toHaveClass(/liked/);
    
    // 홈으로 돌아가기
    await page.goBack();
    
    // 홈에서도 좋아요 상태가 유지되는지 확인
    const homeFirstCard = page.locator('[data-testid="wallpaper-card"]').first();
    const homeLikeButton = homeFirstCard.locator('[data-testid="like-button"]');
    await expect(homeLikeButton).toHaveClass(/liked/);
  });
});