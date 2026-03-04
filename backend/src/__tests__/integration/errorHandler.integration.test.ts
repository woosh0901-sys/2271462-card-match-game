import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { notFoundHandler, errorHandler } from '../../middlewares/errorHandler';

describe('Error Handling Middleware', () => {
  let app: express.Application;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Express 앱 생성
    app = express();
    app.use(express.json());

    // 콘솔 에러 출력 스파이 설정
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    // 스파이 복원
    consoleErrorSpy.mockRestore();
  });

  describe('404 Not Found Handler', () => {
    beforeEach(() => {
      // 404 핸들러와 에러 핸들러 추가
      app.use(notFoundHandler);
      app.use(errorHandler);
    });

    it('존재하지 않는 경로로 요청했을 때 404 응답이 반환되는가?', async () => {
      const response = await request(app).get('/nonexistent-path');

      expect(response.status).toBe(404);
    });

    it('404 에러 응답 본문에 error 메시지가 포함되어 있는가?', async () => {
      const response = await request(app).get('/invalid-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Not Found');
    });

    it('404 에러 응답에 요청 경로가 포함되어 있는가?', async () => {
      const testPath = '/test/path/not/found';
      const response = await request(app).get(testPath);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('path');
      expect(response.body.path).toBe(testPath);
    });

    it('404 에러 발생 시 서버 콘솔에 에러 스택이 출력되는가?', async () => {
      await request(app).get('/not-found');

      expect(consoleErrorSpy).toHaveBeenCalled();
      // 스택 트레이스 출력 확인
      const calls = consoleErrorSpy.mock.calls.flat();
      const hasStackTrace = calls.some((call) =>
        String(call).includes('[Stack Trace]')
      );
      expect(hasStackTrace).toBe(true);
    });
  });

  describe('500 Internal Server Error Handler', () => {
    beforeEach(() => {
      // 의도적으로 에러를 발생시키는 라우트 추가
      app.get('/error', (req: Request, res: Response, next: NextFunction) => {
        const error = new Error('Test error message');
        next(error);
      });

      // 에러 핸들러 추가
      app.use(errorHandler);
    });

    it('의도적으로 에러를 발생시켰을 때 500 응답이 반환되는가?', async () => {
      const response = await request(app).get('/error');

      expect(response.status).toBe(500);
    });

    it('500 에러 응답 본문에 error 메시지가 포함되어 있는가?', async () => {
      const response = await request(app).get('/error');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal Server Error');
    });

    it('500 에러 발생 시 서버 콘솔에 에러 스택이 출력되는가?', async () => {
      await request(app).get('/error');

      expect(consoleErrorSpy).toHaveBeenCalled();

      // 에러 로그의 구성 요소 확인
      const calls = consoleErrorSpy.mock.calls.flat();
      const logOutput = calls.join(' ');

      expect(logOutput).toContain('[Error]');
      expect(logOutput).toContain('[Status]');
      expect(logOutput).toContain('[Path]');
      expect(logOutput).toContain('[Message]');
      expect(logOutput).toContain('[Stack Trace]');
      expect(logOutput).toContain('Test error message');
    });

    it('에러 스택 트레이스가 콘솔에 출력되는가?', async () => {
      await request(app).get('/error');

      const calls = consoleErrorSpy.mock.calls.flat();
      const hasStack = calls.some((call) => {
        const str = String(call);
        return str.includes('Error:') && str.includes('at ');
      });

      expect(hasStack).toBe(true);
    });
  });

  describe('Error Response Format', () => {
    beforeEach(() => {
      app.get('/custom-error', (req: Request, res: Response, next: NextFunction) => {
        res.status(400);
        next(new Error('Custom error'));
      });

      app.use(errorHandler);
    });

    it('커스텀 상태 코드가 설정된 경우 해당 코드를 사용하는가?', async () => {
      const response = await request(app).get('/custom-error');

      expect(response.status).toBe(400);
    });

    it('에러 응답에 요청 경로가 포함되는가?', async () => {
      const response = await request(app).get('/custom-error');

      expect(response.body).toHaveProperty('path');
      expect(response.body.path).toBe('/custom-error');
    });
  });

  describe('Development vs Production Mode', () => {
    beforeEach(() => {
      app.get('/dev-error', (req: Request, res: Response, next: NextFunction) => {
        next(new Error('Development error message'));
      });

      app.use(errorHandler);
    });

    it('개발 모드에서는 에러 메시지가 포함되는가?', async () => {
      process.env.NODE_ENV = 'development';

      const response = await request(app).get('/dev-error');

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Development error message');
    });

    it('프로덕션 모드에서는 에러 메시지가 숨겨지는가?', async () => {
      process.env.NODE_ENV = 'production';

      const response = await request(app).get('/dev-error');

      expect(response.body.message).toBeUndefined();

      // 테스트 환경으로 복원
      process.env.NODE_ENV = 'test';
    });
  });
});
