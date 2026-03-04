import { Router } from 'express';
import { startGame } from '../controllers/gameController';

const router = Router();

/**
 * POST /api/game/start
 * Start a new game session and get shuffled cards
 */
router.get('/start', startGame);

export default router;
