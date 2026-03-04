import { Request, Response, NextFunction } from 'express';

/**
 * 404 Not Found Handler
 * 존재하지 않는 경로에 대한 요청 처리
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Error Handler
 * 모든 에러를 중앙에서 처리하는 미들웨어
 *
 * @param err - Error object
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Express NextFunction
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 이미 설정된 상태 코드가 있으면 사용, 없으면 500
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  // 콘솔에 상세 스택 트레이스 출력
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error(`[Error] ${new Date().toISOString()}`);
  console.error(`[Status] ${statusCode}`);
  console.error(`[Path] ${req.method} ${req.originalUrl}`);
  console.error(`[Message] ${err.message}`);
  console.error('[Stack Trace]');
  console.error(err.stack);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 클라이언트에게 에러 응답 전송
  res.status(statusCode).json({
    error: statusCode === 404 ? 'Not Found' : 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    path: req.originalUrl,
  });
};
