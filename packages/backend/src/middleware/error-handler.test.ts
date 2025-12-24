/**
 * 오류 처리 미들웨어 속성 기반 테스트
 * **Feature: wallpaper-website, Property 13: 오류 메시지 제공**
 * **검증 대상: 요구사항 5.3**
 */

import * as fc from 'fast-check';
import { Request, Response, NextFunction } from 'express';
import { 
  globalErrorHandler, 
  AppError, 
  ERROR_CODES,
  createValidationError,
  createNotFoundError,
  createFileNotFoundError,
  createDatabaseError,
  createErrorResponse,
  getHttpStatusCode
} from './error-handler';

// 모의 Request 객체 생성기
const mockRequestArb = fc.record({
  method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
  url: fc.webPath(),
  ip: fc.ipV4(),
  get: fc.func(fc.string())
});

// 모의 Response 객체 생성
function createMockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    statusCode: 200
  } as unknown as Response;
  
  return res;
}

// AppError 생성기
const appErrorArb = fc.record({
  message: fc.string({ minLength: 1, maxLength: 200 }),
  status: fc.option(fc.integer({ min: 400, max: 599 }), { nil: undefined }),
  errorCode: fc.option(fc.constantFrom(...Object.values(ERROR_CODES)), { nil: undefined }),
  isOperational: fc.option(fc.boolean(), { nil: undefined }),
  stack: fc.option(fc.string(), { nil: undefined })
}).map(data => {
  const error = new Error(data.message) as AppError;
  if (data.status) error.status = data.status;
  if (data.errorCode) error.errorCode = data.errorCode;
  if (data.isOperational !== undefined) error.isOperational = data.isOperational;
  if (data.stack) error.stack = data.stack;
  return error;
});

describe('오류 처리 미들웨어 속성 기반 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 환경 변수 초기화
    delete process.env.NODE_ENV;
  });

  /**
   * **Feature: wallpaper-website, Property 13: 오류 메시지 제공**
   * **검증 대상: 요구사항 5.3**
   * 
   * 모든 시스템 오류 상황에 대해, 사용자에게 적절한 오류 메시지가 제공되어야 한다
   */
  test('속성 13: 오류 메시지 제공', () => {
    fc.assert(
      fc.property(
        appErrorArb,
        mockRequestArb,
        (error, mockReqData) => {
          // Given: 임의의 오류와 요청 객체
          const req = {
            ...mockReqData,
            get: jest.fn().mockReturnValue('test-user-agent')
          } as unknown as Request;
          
          const res = createMockResponse();
          const next = jest.fn() as NextFunction;

          // When: 전역 오류 처리 미들웨어 실행
          globalErrorHandler(error, req, res, next);

          // Then: 적절한 오류 응답이 생성되어야 함
          expect(res.status).toHaveBeenCalledWith(expect.any(Number));
          expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
              success: false,
              message: expect.any(String),
              errorCode: expect.any(String)
            })
          );

          // 상태 코드가 유효한 HTTP 오류 코드여야 함
          const statusCall = (res.status as jest.Mock).mock.calls[0][0];
          expect(statusCall).toBeGreaterThanOrEqual(400);
          expect(statusCall).toBeLessThan(600);

          // 메시지가 비어있지 않아야 함
          const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
          expect(jsonCall.message).toBeTruthy();
          expect(jsonCall.message.length).toBeGreaterThan(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 오류 응답 생성 함수 테스트
   */
  test('오류 응답 생성 일관성', () => {
    fc.assert(
      fc.property(
        appErrorArb,
        (error) => {
          // Given: 임의의 오류
          // When: 오류 응답 생성
          const response = createErrorResponse(error);

          // Then: 응답 구조가 일관되어야 함
          expect(response).toHaveProperty('success', false);
          expect(response).toHaveProperty('message');
          expect(response).toHaveProperty('errorCode');
          
          // 메시지가 비어있지 않아야 함
          expect(response.message).toBeTruthy();
          expect(typeof response.message).toBe('string');
          expect(response.message.length).toBeGreaterThan(0);

          // 오류 코드가 유효해야 함
          expect(response.errorCode).toBeTruthy();
          expect(typeof response.errorCode).toBe('string');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * HTTP 상태 코드 매핑 정확성 테스트
   */
  test('HTTP 상태 코드 매핑 정확성', () => {
    fc.assert(
      fc.property(
        appErrorArb,
        (error) => {
          // Given: 임의의 오류
          // When: HTTP 상태 코드 결정
          const statusCode = getHttpStatusCode(error);

          // Then: 유효한 HTTP 오류 상태 코드여야 함
          expect(statusCode).toBeGreaterThanOrEqual(400);
          expect(statusCode).toBeLessThan(600);

          // 특정 오류 코드에 대한 매핑이 정확해야 함
          if (error.status) {
            expect(statusCode).toBe(error.status);
          } else if (error.errorCode) {
            switch (error.errorCode) {
              case ERROR_CODES.VALIDATION_ERROR:
              case ERROR_CODES.INVALID_REQUEST:
                expect(statusCode).toBe(400);
                break;
              case ERROR_CODES.RESOURCE_NOT_FOUND:
              case ERROR_CODES.FILE_NOT_FOUND:
                expect(statusCode).toBe(404);
                break;
              case ERROR_CODES.DATABASE_ERROR:
                expect(statusCode).toBe(503);
                break;
              default:
                expect(statusCode).toBe(500);
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 커스텀 오류 생성 함수들 테스트
   */
  test('커스텀 오류 생성 함수 일관성', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        (message) => {
          // Given: 오류 메시지
          // When: 각종 커스텀 오류 생성
          const validationError = createValidationError(message);
          const notFoundError = createNotFoundError(message);
          const fileNotFoundError = createFileNotFoundError(message);
          const databaseError = createDatabaseError(message);

          // Then: 모든 오류가 적절한 속성을 가져야 함
          const errors = [validationError, notFoundError, fileNotFoundError, databaseError];
          
          errors.forEach(error => {
            expect(error.message).toBe(message);
            expect(error.isOperational).toBe(true);
            expect(error.status).toBeGreaterThanOrEqual(400);
            expect(error.status).toBeLessThan(600);
            expect(error.errorCode).toBeTruthy();
          });

          // 각 오류 타입별 특성 확인
          expect(validationError.status).toBe(400);
          expect(validationError.errorCode).toBe(ERROR_CODES.VALIDATION_ERROR);

          expect(notFoundError.status).toBe(404);
          expect(notFoundError.errorCode).toBe(ERROR_CODES.RESOURCE_NOT_FOUND);

          expect(fileNotFoundError.status).toBe(404);
          expect(fileNotFoundError.errorCode).toBe(ERROR_CODES.FILE_NOT_FOUND);

          expect(databaseError.status).toBe(503);
          expect(databaseError.errorCode).toBe(ERROR_CODES.DATABASE_ERROR);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 프로덕션 환경에서의 오류 메시지 보안 테스트
   */
  test('프로덕션 환경 오류 메시지 보안', () => {
    // 프로덕션 환경 설정
    process.env.NODE_ENV = 'production';

    fc.assert(
      fc.property(
        fc.record({
          message: fc.string({ minLength: 1, maxLength: 200 }),
          isOperational: fc.boolean(),
          stack: fc.option(fc.string(), { nil: undefined })
        }),
        (errorData) => {
          // Given: 운영 오류 (isOperational = false)
          const error = new Error(errorData.message) as AppError;
          error.isOperational = errorData.isOperational;
          if (errorData.stack) error.stack = errorData.stack;

          // When: 오류 응답 생성
          const response = createErrorResponse(error);

          // Then: 비운영 오류의 경우 일반적인 메시지가 반환되어야 함
          if (!error.isOperational) {
            expect(response.message).toBe('내부 서버 오류가 발생했습니다');
            expect(response.details).toBeUndefined();
          } else {
            expect(response.message).toBe(errorData.message);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});