import { Request, Response } from 'express';
import { startGame } from '../../controllers/gameController';
import { generateCards } from '../../utils/generateCards';
import { Card } from '../../types/Card';

// generateCards 모듈 mock → 컨트롤러 로직만 격리
// 비유: 엔진 테스트 시 연료 시스템을 가짜로 교체하여 엔진 로직만 검증
jest.mock('../../utils/generateCards');
const mockGenerateCards = generateCards as jest.MockedFunction<typeof generateCards>;

// 테스트용 고정 카드 데이터
const MOCK_CARDS: Card[] = [
  { id: 'card-1', type: 'apple', imgUrl: '/images/apple.png' },
  { id: 'card-2', type: 'apple', imgUrl: '/images/apple.png' },
];

describe('gameController.startGame — Unit Tests', () => {
  let mockReq: Request;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // 각 테스트 전 모든 mock 호출 횟수/결과 초기화
    jest.clearAllMocks();

    // req / res mock 초기화
    mockReq = {} as Request;
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // generateCards mock 기본값 설정
    mockGenerateCards.mockReturnValue(MOCK_CARDS);

    // console 출력 억제 (테스트 결과 오염 방지)
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ───────────────────────────────────────────────────────────
  // [정상 응답] 케이스
  // ───────────────────────────────────────────────────────────
  describe('[정상 응답]', () => {
    it('res.status(200)이 호출되는가?', () => {
      startGame(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('res.json()이 호출되는가?', () => {
      startGame(mockReq, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalled();
    });

    it('응답 본문에 gameId와 cards 필드가 존재하는가?', () => {
      startGame(mockReq, mockRes as Response);

      const jsonCall = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall).toHaveProperty('gameId');
      expect(jsonCall).toHaveProperty('cards');
    });

    it('gameId가 UUID v4 형식인가?', () => {
      startGame(mockReq, mockRes as Response);

      const { gameId } = (mockRes.json as jest.Mock).mock.calls[0][0];
      const uuidV4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(gameId).toMatch(uuidV4Regex);
    });

    it('cards가 generateCards() mock의 반환값과 일치하는가?', () => {
      startGame(mockReq, mockRes as Response);

      const { cards } = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(cards).toBe(MOCK_CARDS);
    });

    it('generateCards()가 정확히 1회 호출되는가?', () => {
      startGame(mockReq, mockRes as Response);

      expect(mockGenerateCards).toHaveBeenCalledTimes(1);
    });
  });

  // ───────────────────────────────────────────────────────────
  // [에러 처리] 케이스
  // ───────────────────────────────────────────────────────────
  describe('[에러 처리]', () => {
    it('generateCards()가 예외를 던질 때 res.status(500)이 호출되는가?', () => {
      mockGenerateCards.mockImplementation(() => {
        throw new Error('generateCards failure');
      });

      startGame(mockReq, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('500 응답 본문에 error: "Failed to start game"이 포함되는가?', () => {
      mockGenerateCards.mockImplementation(() => {
        throw new Error('generateCards failure');
      });

      startGame(mockReq, mockRes as Response);

      const jsonCall = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall).toEqual({ error: 'Failed to start game' });
    });
  });

  // ───────────────────────────────────────────────────────────
  // [성능 경고 로직] 케이스
  // 비유: Date.now()를 조작하여 시계를 빨리 돌려 200ms 초과 상황을 시뮬레이션
  // ───────────────────────────────────────────────────────────
  describe('[성능 경고 로직]', () => {
    it('응답 시간 > 200ms 시 console.warn이 호출되는가?', () => {
      // Date.now()를 mock하여 첫 호출(startTime)과 두 번째 호출(responseTime) 차이를 201ms로 설정
      let callCount = 0;
      jest.spyOn(Date, 'now').mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 0 : 201;
      });

      startGame(mockReq, mockRes as Response);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Response time exceeded 200ms')
      );
    });

    it('응답 시간 <= 200ms 시 console.warn이 호출되지 않는가?', () => {
      // Date.now()를 동일 값으로 고정 → 응답 시간 0ms
      jest.spyOn(Date, 'now').mockReturnValue(0);

      startGame(mockReq, mockRes as Response);

      expect(console.warn).not.toHaveBeenCalled();
    });
  });
});
