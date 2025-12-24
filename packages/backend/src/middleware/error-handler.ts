/**
 * 전역 오류 처리 미들웨어
 * 요구사항 5.3: 시스템 오류 발생 시 적절한 오류 메시지 제공
 */

import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// 오류 타입 정의
export interface AppError extends Error {
  status?: number;
  errorCode?: string;
  isOperational?: boolean;
}

// 오류 코드 상수
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  INVALID_REQUEST: 'INVALID_REQUEST',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED'
} as const;

// 오류 로깅 함수
export function logError(error: AppError, req: Request): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    error: {
      message: error.message,
      stack: error.stack,
      status: error.status,
      errorCode: error.errorCode
    }
  };

  // 로그 디렉토리 생성
  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // 로그 파일에 기록
  const logFile = path.join(logsDir, `error-${new Date().toISOString().split('T')[0]}.log`);
  const logLine = JSON.stringify(logEntry) + '\n';
  
  fs.appendFileSync(logFile, logLine);
  
  // 콘솔에도 출력 (개발 환경, 테스트 환경 제외)
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    console.error('🚨 오류 발생:', logEntry);
  }
}

// 오류 응답 생성 함수
export function createErrorResponse(error: AppError): {
  success: boolean;
  message: string;
  errorCode: string;
  details?: any;
} {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    success: false,
    message: isProduction && !error.isOperational 
      ? '내부 서버 오류가 발생했습니다' 
      : error.message,
    errorCode: error.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR,
    ...((!isProduction || error.isOperational) && error.stack && { 
      details: error.stack 
    })
  };
}

// HTTP 상태 코드 매핑
export function getHttpStatusCode(error: AppError): number {
  if (error.status) {
    return error.status;
  }

  switch (error.errorCode) {
    case ERROR_CODES.VALIDATION_ERROR:
    case ERROR_CODES.INVALID_REQUEST:
      return 400;
    case ERROR_CODES.UNAUTHORIZED:
      return 401;
    case ERROR_CODES.RESOURCE_NOT_FOUND:
    case ERROR_CODES.FILE_NOT_FOUND:
      return 404;
    case ERROR_CODES.DATABASE_ERROR:
      return 503;
    default:
      return 500;
  }
}

// 전역 오류 처리 미들웨어
export function globalErrorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 오류 로깅
  logError(error, req);

  // HTTP 상태 코드 결정
  const statusCode = getHttpStatusCode(error);

  // 오류 응답 생성
  const errorResponse = createErrorResponse(error);

  // 응답 전송
  res.status(statusCode).json(errorResponse);
}

// 커스텀 오류 생성 헬퍼 함수들
export function createValidationError(message: string): AppError {
  const error = new Error(message) as AppError;
  error.status = 400;
  error.errorCode = ERROR_CODES.VALIDATION_ERROR;
  error.isOperational = true;
  return error;
}

export function createNotFoundError(message: string): AppError {
  const error = new Error(message) as AppError;
  error.status = 404;
  error.errorCode = ERROR_CODES.RESOURCE_NOT_FOUND;
  error.isOperational = true;
  return error;
}

export function createFileNotFoundError(message: string): AppError {
  const error = new Error(message) as AppError;
  error.status = 404;
  error.errorCode = ERROR_CODES.FILE_NOT_FOUND;
  error.isOperational = true;
  return error;
}

export function createDatabaseError(message: string): AppError {
  const error = new Error(message) as AppError;
  error.status = 503;
  error.errorCode = ERROR_CODES.DATABASE_ERROR;
  error.isOperational = true;
  return error;
}

export function createUnauthorizedError(message: string): AppError {
  const error = new Error(message) as AppError;
  error.status = 401;
  error.errorCode = ERROR_CODES.UNAUTHORIZED;
  error.isOperational = true;
  return error;
}