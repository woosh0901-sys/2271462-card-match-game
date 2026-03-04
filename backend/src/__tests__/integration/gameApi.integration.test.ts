import request from 'supertest';
import app from '../../server';

describe('GET /health', () => {
  test('should return 200 with status ok', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/game/start', () => {
  test('should return 200 status code', async () => {
    const response = await request(app).get('/api/game/start');

    expect(response.status).toBe(200);
  });

  test('should return gameId and cards in response body', async () => {
    const response = await request(app).get('/api/game/start');

    expect(response.body).toHaveProperty('gameId');
    expect(response.body).toHaveProperty('cards');
  });

  test('should return 16 cards', async () => {
    const response = await request(app).get('/api/game/start');

    expect(response.body.cards).toHaveLength(16);
  });

  test('each card should have id, type, and imgUrl', async () => {
    const response = await request(app).get('/api/game/start');
    const { cards } = response.body;

    cards.forEach((card: any) => {
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('type');
      expect(card).toHaveProperty('imgUrl');
      expect(typeof card.id).toBe('string');
      expect(typeof card.type).toBe('string');
      expect(typeof card.imgUrl).toBe('string');
    });
  });

  test('gameId should be a valid UUID', async () => {
    const response = await request(app).get('/api/game/start');
    const { gameId } = response.body;

    // UUID v4 regex pattern
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(gameId).toMatch(uuidRegex);
  });

  test('response time should be under 200ms', async () => {
    const startTime = Date.now();
    await request(app).get('/api/game/start');
    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(200);
  });

  test('should return different gameIds on multiple calls', async () => {
    const response1 = await request(app).get('/api/game/start');
    const response2 = await request(app).get('/api/game/start');

    expect(response1.body.gameId).not.toBe(response2.body.gameId);
  });

  test('should have 2 cards of each fruit type', async () => {
    const response = await request(app).get('/api/game/start');
    const { cards } = response.body;

    const typeCounts: { [key: string]: number } = {};
    cards.forEach((card: any) => {
      typeCounts[card.type] = (typeCounts[card.type] || 0) + 1;
    });

    // Each type should appear exactly twice
    Object.values(typeCounts).forEach((count) => {
      expect(count).toBe(2);
    });

    // Should have exactly 8 different types
    expect(Object.keys(typeCounts).length).toBe(8);
  });
});
