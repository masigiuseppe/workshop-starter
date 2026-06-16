import { Router } from 'express';

const router = Router();

// ✅ Endpoint di ESEMPIO, già implementato.
// Usalo come riferimento di stile mentre completi products.ts nel Lab 1.

/**
 * GET /api/health
 *
 * Health-check endpoint. Returns the current server status and timestamp.
 *
 * @returns 200 - JSON object with `status: "ok"` and the current ISO timestamp.
 */
router.get('/', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
