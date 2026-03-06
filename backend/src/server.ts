import express, { Request, Response } from 'express';
import cors from 'cors';
import gameRouter from './routes/game';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Game Routes
app.use('/api/game', gameRouter);

// Error Handling Middlewares (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server (only if not in test environment)
/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📋 Health Check: http://localhost:${PORT}/health`);
  });
}

export default app;
