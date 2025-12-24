/**
 * 관리자 인증 미들웨어
 * 배경화면 업로드 등 관리자 전용 기능에 대한 접근을 제어합니다.
 */

import { Request, Response, NextFunction } from 'express';
import { createUnauthorizedError } from './error-handler';

/**
 * 관리자 인증 미들웨어
 * Authorization 헤더에서 관리자 키를 확인합니다.
 */
export function adminAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw createUnauthorizedError('인증 헤더가 필요합니다');
    }
    
    // Bearer 토큰 형식 확인
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    const adminSecretKey = process.env.ADMIN_SECRET_KEY;
    
    if (!adminSecretKey) {
      console.error('ADMIN_SECRET_KEY 환경변수가 설정되지 않았습니다');
      throw createUnauthorizedError('서버 설정 오류');
    }
    
    if (token !== adminSecretKey) {
      throw createUnauthorizedError('유효하지 않은 관리자 키입니다');
    }
    
    // 인증 성공 - 다음 미들웨어로 진행
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * 관리자 상태 확인 함수
 * 클라이언트에서 현재 사용자가 관리자인지 확인할 때 사용
 */
export function checkAdminStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const adminSecretKey = process.env.ADMIN_SECRET_KEY;
    
    if (!authHeader || !adminSecretKey) {
      res.json({ isAdmin: false });
      return;
    }
    
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    const isAdmin = token === adminSecretKey;
    
    res.json({ isAdmin });
  } catch (error) {
    next(error);
  }
}