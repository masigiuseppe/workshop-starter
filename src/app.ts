import express from 'express';
import healthRouter from './routes/health';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import { errorHandler } from './middleware/errorHandler';

// Costruisce e configura l'app Express.
// Esportata separatamente da index.ts per poterla testare (Lab 2) senza
// avviare un server in ascolto.
export function createApp() {
  const app = express();
  app.use(express.json());

  app.use('/api/health', healthRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);

  app.use(errorHandler);
  return app;
}
