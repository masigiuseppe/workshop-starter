import { Request, Response, NextFunction } from 'express';

/**
 * Gestore errori centralizzato dell'applicazione.
 */

interface AppError extends Error {
  status?: number;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  console.error('[errorHandler]', err.message);
  res.status(err.status || 500).json({ error: err.message });
}
