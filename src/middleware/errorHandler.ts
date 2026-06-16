import { Request, Response, NextFunction } from 'express';

/**
 * Gestore errori centralizzato dell'applicazione.
 *
 * ⚠️  BUG INTENZIONALE (Lab 1 · Parte C)
 *     La proprietà `status` non esiste sul tipo `Error`: la riga sotto
 *     produce un errore TypeScript (sottolineato in rosso in VS Code).
 *     Apri la Chat di Copilot, seleziona la funzione e usa  /fix  per correggerlo.
 *     Suggerimento: definisci un tipo errore con statusCode, oppure usa
 *     un fallback (es. 500) quando lo status non è presente.
 */
export function errorHandler(err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) {
  console.error('[errorHandler]', err.message);
  res.status(err.status || 500).json({ error: err.message });
}
