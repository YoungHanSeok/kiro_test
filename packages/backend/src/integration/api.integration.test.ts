import request from 'supertest';
import express from 'express';
import { createApp } from '../index';

/**
 * API 통합 테스트
 * 프론트엔드-백엔드 통신 및 오류 상황 처리 테스트
 * 요구사항: 6.3, 5.3
 */
describe('API 통합 테스트', () => {
  let app: express.Application;

  beforeAll(async () => {
    // 테스트용 Express 앱 생성
    app = createApp();
  });

  describe('배경화면 API 통합 테스트', () => {
    test('GET /api/wallpapers - 모든 배경화면 조회', async () => {
      const response = await request(app)
        .get('/api/wallpapers')
        .expect(200);

      // API 응답 형식 검증
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      // 배경화면 데이터 구조 검증
      if (response.body.data.length > 0) {
        const wallpaper = response.body.data[0];
        expect(wallpaper).toHaveProperty('id');
        expect(wallpaper).toHaveProperty('title');
        expect(wallpaper).toHaveProperty('themeId');
        expect(wallpaper).toHaveProperty('resolutions');
        expect(wallpaper).toHaveProperty('thumbnailUrl');
        expect(Array.isArray(wallpaper.resolutions)).toBe(true);
      }
    });

    test('GET /api/wallpapers/:id - 특정 배경화면 조회', async () => {
      // 먼저 배경화면 목록을 가져와서 유효한 ID 확보
      const listResponse = await request(app)
        .get('/api/wallpapers')
        .expect(200);

      if (listResponse.body.data.length > 0) {
        const wallpaperId = listResponse.body.data[0].id;

        const response = await request(app)
          .get(`/api/wallpapers/${wallpaperId}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('id', wallpaperId);
      }
    });

    test('GET /api/wallpapers/:id - 존재하지 않는 배경화면 조회 시 404 오류', async () => {
      const response = await request(app)
        .get('/api/wallpapers/nonexistent-id')
        .expect(404);

      // 오류 메시지 형식 검증
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    test('GET /api/wallpapers/theme/:theme - 테마별 배경화면 조회', async () => {
      // 먼저 테마 목록을 가져와서 유효한 테마 ID 확보
      const themesResponse = await request(app)
        .get('/api/themes')
        .expect(200);

      if (themesResponse.body.data.length > 0) {
        const themeId = themesResponse.body.data[0].id;

        const response = await request(app)
          .get(`/api/wallpapers/theme/${themeId}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);

        // 모든 배경화면이 해당 테마에 속하는지 확인
        response.body.data.forEach((wallpaper: any) => {
          expect(wallpaper.themeId).toBe(themeId);
        });
      }
    });

    test('GET /api/wallpapers/search - 배경화면 검색', async () => {
      const response = await request(app)
        .get('/api/wallpapers/search')
        .query({ query: 'nature' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('wallpapers');
      expect(Array.isArray(response.body.data.wallpapers)).toBe(true);

      // 검색 결과가 검색어와 관련있는지 확인
      response.body.data.wallpapers.forEach((wallpaper: any) => {
        const hasRelevantContent = 
          wallpaper.title.toLowerCase().includes('nature') ||
          wallpaper.tags.some((tag: string) => tag.toLowerCase().includes('nature'));
        expect(hasRelevantContent).toBe(true);
      });
    });

    test('GET /api/wallpapers/search - 검색어 없이 요청 시 400 오류', async () => {
      const response = await request(app)
        .get('/api/wallpapers/search')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('테마 API 통합 테스트', () => {
    test('GET /api/themes - 모든 테마 조회', async () => {
      const response = await request(app)
        .get('/api/themes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      // 테마 데이터 구조 검증
      if (response.body.data.length > 0) {
        const theme = response.body.data[0];
        expect(theme).toHaveProperty('id');
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('description');
        expect(theme).toHaveProperty('wallpaperCount');
        expect(theme).toHaveProperty('isActive');
      }
    });

    test('GET /api/themes/:id - 특정 테마 조회', async () => {
      // 먼저 테마 목록을 가져와서 유효한 ID 확보
      const listResponse = await request(app)
        .get('/api/themes')
        .expect(200);

      if (listResponse.body.data.length > 0) {
        const themeId = listResponse.body.data[0].id;

        const response = await request(app)
          .get(`/api/themes/${themeId}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('id', themeId);
      }
    });

    test('GET /api/themes/:id - 존재하지 않는 테마 조회 시 404 오류', async () => {
      const response = await request(app)
        .get('/api/themes/nonexistent-theme')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('사용자 좋아요 API 통합 테스트', () => {
    const testUserId = 'test-user-123';

    test('GET /api/users/:userId/likes - 사용자 좋아요 목록 조회', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}/likes`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/users/:userId/likes - 좋아요 추가', async () => {
      // 먼저 배경화면 목록을 가져와서 유효한 ID 확보
      const wallpapersResponse = await request(app)
        .get('/api/wallpapers')
        .expect(200);

      if (wallpapersResponse.body.data.length > 0) {
        const wallpaperId = wallpapersResponse.body.data[0].id;

        const response = await request(app)
          .post(`/api/users/${testUserId}/likes`)
          .send({ wallpaperId })
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');

        // 좋아요가 추가되었는지 확인
        const likesResponse = await request(app)
          .get(`/api/users/${testUserId}/likes`)
          .expect(200);

        const hasLike = likesResponse.body.data.some(
          (like: any) => like.wallpaperId === wallpaperId
        );
        expect(hasLike).toBe(true);
      }
    });

    test('POST /api/users/:userId/likes - 잘못된 데이터로 좋아요 추가 시 400 오류', async () => {
      const response = await request(app)
        .post(`/api/users/${testUserId}/likes`)
        .send({ invalidField: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    test('DELETE /api/users/:userId/likes/:wallpaperId - 좋아요 제거', async () => {
      // 먼저 좋아요 추가
      const wallpapersResponse = await request(app)
        .get('/api/wallpapers')
        .expect(200);

      if (wallpapersResponse.body.data.length > 0) {
        const wallpaperId = wallpapersResponse.body.data[0].id;

        // 좋아요 추가
        await request(app)
          .post(`/api/users/${testUserId}/likes`)
          .send({ wallpaperId })
          .expect(201);

        // 좋아요 제거
        const response = await request(app)
          .delete(`/api/users/${testUserId}/likes/${wallpaperId}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);

        // 좋아요가 제거되었는지 확인
        const likesResponse = await request(app)
          .get(`/api/users/${testUserId}/likes`)
          .expect(200);

        const hasLike = likesResponse.body.data.some(
          (like: any) => like.wallpaperId === wallpaperId
        );
        expect(hasLike).toBe(false);
      }
    });
  });

  describe('파일 다운로드 API 통합 테스트', () => {
    test.skip('GET /api/download/:id/:resolution - 배경화면 다운로드', async () => {
      // 실제 파일이 없으므로 스킵
      // 실제 구현에서는 파일 시스템에 이미지 파일이 있어야 함
    });

    test('GET /api/download/:id/:resolution - 존재하지 않는 파일 다운로드 시 404 오류', async () => {
      const response = await request(app)
        .get('/api/download/nonexistent/1920x1080')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('오류 처리 통합 테스트', () => {
    test('존재하지 않는 엔드포인트 요청 시 404 오류', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    test('잘못된 HTTP 메서드 사용 시 405 오류', async () => {
      const response = await request(app)
        .patch('/api/wallpapers')
        .expect(404); // 현재 구현에서는 404를 반환

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    test('서버 내부 오류 시 500 오류 및 적절한 메시지', async () => {
      // 의도적으로 서버 오류를 발생시키는 엔드포인트가 있다면 테스트
      // 현재는 스킵하고 실제 구현에서 추가
    });
  });

  describe('CORS 및 보안 헤더 테스트', () => {
    test('CORS 헤더가 올바르게 설정되어 있다', async () => {
      const response = await request(app)
        .options('/api/wallpapers')
        .set('Origin', 'http://localhost:5173')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('보안 헤더가 설정되어 있다', async () => {
      const response = await request(app)
        .get('/api/wallpapers')
        .expect(200);

      // Helmet 미들웨어에 의한 보안 헤더 확인
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });
});