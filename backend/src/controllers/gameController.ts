import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { generateCards } from '../utils/generateCards';
import { Difficulty, DIFFICULTY_CONFIG } from '../types/Card';

/**
 * Start a new game session
 * GET /api/game/start?difficulty=easy|normal|hard
 *
 * @returns { gameId, difficulty, gridCols, cards }
 */
export const startGame = (req: Request, res: Response): void => {
  const startTime = Date.now();

  try {
    // 난이도 파라미터 파싱 & 검증 (기본값: normal)
    const rawDifficulty = req.query.difficulty as string | undefined;
    const difficulty: Difficulty =
      rawDifficulty === 'easy' || rawDifficulty === 'hard'
        ? rawDifficulty
        : 'normal';

    const { gridCols } = DIFFICULTY_CONFIG[difficulty];

    // Generate unique game ID
    const gameId = randomUUID();

    // Generate and shuffle cards based on difficulty
    const cards = generateCards(difficulty);

    // Performance logging
    const responseTime = Date.now() - startTime;
    console.log(`[Game Start] gameId: ${gameId}, difficulty: ${difficulty}, cards: ${cards.length}, responseTime: ${responseTime}ms`);

    if (responseTime > 200) {
      console.warn(`⚠️  Response time exceeded 200ms: ${responseTime}ms`);
    }

    res.status(200).json({
      gameId,
      difficulty,
      gridCols,
      cards,
    });
  } catch (error) {
    console.error('[Game Start Error]', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
};
