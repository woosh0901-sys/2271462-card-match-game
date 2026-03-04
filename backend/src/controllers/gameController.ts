import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { generateCards } from '../utils/generateCards';

/**
 * Start a new game session
 * GET /api/game/start
 *
 * @returns {gameId: string, cards: Card[]}
 */
export const startGame = (req: Request, res: Response): void => {
  const startTime = Date.now();

  try {
    // Generate unique game ID
    const gameId = randomUUID();

    // Generate and shuffle 16 cards
    const cards = generateCards();

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Log performance
    console.log(`[Game Start] gameId: ${gameId}, responseTime: ${responseTime}ms`);

    // Warn if response time exceeds 200ms
    if (responseTime > 200) {
      console.warn(`⚠️  Response time exceeded 200ms: ${responseTime}ms`);
    }

    // Send response
    res.status(200).json({
      gameId,
      cards,
    });
  } catch (error) {
    console.error('[Game Start Error]', error);
    res.status(500).json({
      error: 'Failed to start game',
    });
  }
};
