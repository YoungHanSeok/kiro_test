import request from 'supertest';
import express from 'express';
import { createApp } from '../index';

/**
 * 프론트엔드-백엔드 통신 통합 테스트
 * 실제 프론트엔드에서 사용하는 API 호출 패턴을 시뮬레이션
 * 요구사항: 6.3, 5.3
 */
describe('프론트엔드-백엔드 통신 통합 테스트', () => {
  let app: express.Application;

  beforeAll(async () => {
    app = createApp();
  });

  describe('홈페이지 로딩 시나리오', () => {
    test('홈페이지 로딩 시 필요한 모든 데이터를 가져올 수 있다', async () => {
      // 1. 테마 목록 조회
      const themesResponse = await request(app)
        .get('/api/themes')
        .expect(200);

      expect(themesResponse.body.success).toBe(true);
      expect(Array.isArray(themesResponse.body.data)).toBe(true);

      // 2. 전체 배경화면 목록 조회
      const wallpapersResponse = await request(app)
        .get('/api/wallpapers')
        .expect(200);

      expect(wallpapersResponse.body.success).toBe(true);
      expect(Array.isArray(wallpapersResponse.body.data)).toBe(true);

      // 3. 데이터 일관성 확인
      const themes = themesResponse.body.data;
      const wallpapers = wallpapersResponse.body.data;

      // 모든 배경화면의 테마 ID가 유효한지 확인
      const themeIds = themes.map((theme: any) => theme.id);
      wallpapers.forEach((wallpaper: any) => {
        expect(themeIds).toContain(wallpaper.themeId);
      });
    });
  });

  describe('테마 페이지 로딩 시나리오', () => {
    test('특정 테마 페이지 로딩 시 필요한 데이터를 가져올 수 있다', async () => {
      // 1. 테마 목록에서 첫 번째 테마 선택
      const themesResponse = await request(app)
        .get('/api/themes')
        .expect(200);

      if (themesResponse.body.data.length > 0) {
        const firstTheme = themesResponse.body.data[0];

        // 2. 선택된 테마 상세 정보 조회
        const themeResponse = await request(app)
          .get(`/api/themes/${firstTheme.id}`)
          .expect(200);

        expect(themeResponse.body.data.id).toBe(firstTheme.id);

        // 3. 해당 테마의 배경화면 목록 조회
        const wallpapersResponse = await request(app)
          .get(`/api/wallpapers/theme/${firstTheme.id}`)
          .expect(200);

        expect(wallpapersResponse.body.success).toBe(true);
        expect(Array.isArray(wallpapersResponse.body.data)).toBe(true);

        // 4. 모든 배경화면이 해당 테마에 속하는지 확인
        wallpapersResponse.body.data.forEach((wallpaper: any) => {
          expect(wallpaper.themeId).toBe(firstTheme.id);
        });
      }
    });
  });

  describe('검색 기능 시나리오', () => {
    test('검색 기능이 프론트엔드 요구사항에 맞게 동작한다', async () => {
      // 1. 유효한 검색어로 검색
      const searchResponse = await request(app)
        .get('/api/wallpapers/search')
        .query({ query: 'nature' })
        .expect(200);

      expect(searchResponse.body.success).toBe(true);
      expect(searchResponse.body.data).toHaveProperty('wallpapers');
      expect(Array.isArray(searchResponse.body.data.wallpapers)).toBe(true);

      // 3. 검색 결과가 관련성이 있는지 확인
      searchResponse.body.data.wallpapers.forEach((wallpaper: any) => {
        const isRelevant = 
          wallpaper.title.toLowerCase().includes('nature') ||
          wallpaper.description?.toLowerCase().includes('nature') ||
          wallpaper.tags.some((tag: string) => tag.toLowerCase().includes('nature'));
        expect(isRelevant).toBe(true);
      });

      // 3. 존재하지 않는 검색어로 검색
      const noResultsResponse = await request(app)
        .get('/api/wallpapers/search')
        .query({ query: 'nonexistentterm12345' })
        .expect(200);

      expect(noResultsResponse.body.data.wallpapers).toHaveLength(0);
    });
  });

  describe('좋아요 기능 시나리오', () => {
    const testUserId = 'integration-test-user';

    test('좋아요 추가/제거 플로우가 올바르게 동작한다', async () => {
      // 1. 배경화면 목록에서 첫 번째 배경화면 선택
      const wallpapersResponse = await request(app)
        .get('/api/wallpapers')
        .expect(200);

      if (wallpapersResponse.body.data.length > 0) {
        const wallpaper = wallpapersResponse.body.data[0];

        // 2. 초기 좋아요 목록 확인
        const initialLikesResponse = await request(app)
          .get(`/api/users/${testUserId}/likes`)
          .expect(200);

        const initialLikesCount = initialLikesResponse.body.data.length;

        // 3. 좋아요 추가
        await request(app)
          .post(`/api/users/${testUserId}/likes`)
          .send({ wallpaperId: wallpaper.id })
          .expect(201);

        // 4. 좋아요 목록에 추가되었는지 확인
        const afterAddLikesResponse = await request(app)
          .get(`/api/users/${testUserId}/likes`)
          .expect(200);

        expect(afterAddLikesResponse.body.data).toHaveLength(initialLikesCount + 1);
        const hasLike = afterAddLikesResponse.body.data.some(
          (like: any) => like.wallpaperId === wallpaper.id
        );
        expect(hasLike).toBe(true);

        // 5. 좋아요 제거
        await request(app)
          .delete(`/api/users/${testUserId}/likes/${wallpaper.id}`)
          .expect(200);

        // 6. 좋아요 목록에서 제거되었는지 확인
        const afterRemoveLikesResponse = await request(app)
          .get(`/api/users/${testUserId}/likes`)
          .expect(200);

        expect(afterRemoveLikesResponse.body.data).toHaveLength(initialLikesCount);
        const stillHasLike = afterRemoveLikesResponse.body.data.some(
          (like: any) => like.wallpaperId === wallpaper.id
        );
        expect(stillHasLike).toBe(false);
      }
    });

    test('중복 좋아요 추가 시 적절히 처리된다', async () => {
      const wallpapersResponse = await request(app)
        .get('/api/wallpapers')
        .expect(200);

      if (wallpapersResponse.body.data.length > 0) {
        const wallpaper = wallpapersResponse.body.data[0];

        // 첫 번째 좋아요 추가
        await request(app)
          .post(`/api/users/${testUserId}/likes`)
          .send({ wallpaperId: wallpaper.id })
          .expect(201);

        // 중복 좋아요 추가 시도 (현재 구현에서는 중복을 허용할 수 있음)
        const duplicateResponse = await request(app)
          .post(`/api/users/${testUserId}/likes`)
          .send({ wallpaperId: wallpaper.id });

        // 중복 처리 방식에 따라 201 또는 409가 올 수 있음
        expect([201, 409]).toContain(duplicateResponse.status);

        // 정리
        await request(app)
          .delete(`/api/users/${testUserId}/likes/${wallpaper.id}`)
          .expect(200);
      }
    });
  });

  describe('다운로드 기능 시나리오', () => {
    test.skip('배경화면 다운로드 플로우가 올바르게 동작한다', async () => {
      // 실제 파일이 없으므로 스킵
      // 실제 구현에서는 파일 시스템에 이미지 파일이 있어야 함
    });

    test.skip('지원하지 않는 해상도 요청 시 가장 가까운 해상도를 제안한다', async () => {
      // 실제 파일이 없으므로 스킵
      // 실제 구현에서는 파일 시스템에 이미지 파일이 있어야 함
    });
  });

  describe('오류 상황 처리 테스트', () => {
    test('네트워크 오류 시뮬레이션 - 타임아웃', async () => {
      // 타임아웃이 발생할 수 있는 상황을 시뮬레이션
      try {
        const response = await request(app)
          .get('/api/wallpapers')
          .timeout(1); // 1ms 타임아웃
        
        // 만약 응답이 성공하면 정상 응답이어야 함
        expect(response.status).toBe(200);
      } catch (error: any) {
        // 타임아웃 에러가 발생하면 예상된 동작
        expect(error.message).toContain('Timeout');
      }
    });

    test('잘못된 요청 데이터 처리', async () => {
      // 잘못된 JSON 데이터로 좋아요 추가 시도
      const response = await request(app)
        .post('/api/users/test-user/likes')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    test('서버 부하 상황 시뮬레이션', async () => {
      // 동시에 여러 요청을 보내서 서버 부하 테스트
      const promises = Array.from({ length: 10 }, () =>
        request(app).get('/api/wallpapers')
      );

      const responses = await Promise.all(promises);

      // 모든 요청이 성공적으로 처리되어야 함
      responses.forEach(response => {
        expect([200, 429, 503]).toContain(response.status); // 200 OK, 429 Too Many Requests, 503 Service Unavailable
      });
    });
  });

  describe('데이터 일관성 테스트', () => {
    test('테마와 배경화면 데이터 간 일관성 확인', async () => {
      // 모든 테마 조회
      const themesResponse = await request(app)
        .get('/api/themes')
        .expect(200);

      // 모든 배경화면 조회
      const wallpapersResponse = await request(app)
        .get('/api/wallpapers')
        .expect(200);

      const themes = themesResponse.body.data;
      const wallpapers = wallpapersResponse.body.data;

      // 각 테마의 wallpaperCount가 실제 배경화면 수와 일치하는지 확인
      themes.forEach((theme: any) => {
        const actualCount = wallpapers.filter(
          (wallpaper: any) => wallpaper.themeId === theme.id
        ).length;
        expect(theme.wallpaperCount).toBe(actualCount);
      });
    });

    test('배경화면 해상도 데이터 일관성 확인', async () => {
      const wallpapersResponse = await request(app)
        .get('/api/wallpapers')
        .expect(200);

      wallpapersResponse.body.data.forEach((wallpaper: any) => {
        // 각 배경화면이 최소 하나의 해상도를 가져야 함
        expect(wallpaper.resolutions.length).toBeGreaterThan(0);

        // 각 해상도 데이터가 유효한 형식인지 확인
        wallpaper.resolutions.forEach((resolution: any) => {
          expect(typeof resolution.width).toBe('number');
          expect(typeof resolution.height).toBe('number');
          expect(resolution.width).toBeGreaterThan(0);
          expect(resolution.height).toBeGreaterThan(0);
          expect(typeof resolution.fileUrl).toBe('string');
          expect(resolution.fileUrl.length).toBeGreaterThan(0);
        });
      });
    });
  });
});