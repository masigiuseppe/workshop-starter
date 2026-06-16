import { Router } from 'express';
import { NewOrder } from '../types/order';
import { paginate } from '../lib/pagination';
import { validateNewOrder } from '../validators/orderValidator';
import {
  OrderRepository,
  inMemoryOrderRepository,
} from '../repositories/orderRepository';

/**
 * Costruisce il router degli ordini.
 *
 * Il repository è iniettabile (default: implementazione in memoria) così la
 * route dipende dall'astrazione, non dallo store concreto. Gli handler si
 * limitano a orchestrare: paginazione/validazione e persistenza vivono altrove.
 */
export function createOrdersRouter(
  repository: OrderRepository = inMemoryOrderRepository,
): Router {
  const router = Router();

  /**
   * GET /api/orders
   *
   * Returns a paginated list of all orders.
   *
   * @query page  - Page number (default: 1). Must be a positive integer.
   * @query limit - Number of items per page (default: 10). Must be a positive integer.
   *
   * @returns 200 - Array of Order objects for the requested page.
   * @returns 400 - If `page` or `limit` is less than 1.
   */
  router.get('/', async (req, res) => {
    const result = paginate(repository.list(), req.query.page, req.query.limit);
    if ('error' in result) {
      return res.status(400).json(result);
    }
    return res.json(result.data);
  });

  /**
   * POST /api/orders
   *
   * Creates a new order and appends it to the store.
   *
   * @body productId {number}  Required. ID of the product being ordered.
   * @body quantity  {number}  Required. Positive integer quantity.
   * @body status    {string}  Optional. Order status (e.g. 'pending', 'completed').
   *
   * @returns 201 - The newly created Order object (including generated `id`).
   * @returns 400 - If validation fails (see `details` for the offending fields).
   */
  router.post('/', async (req, res) => {
    const result = validateNewOrder(req.body as Partial<NewOrder>);
    if ('error' in result) {
      return res.status(400).json(result.error);
    }
    return res.status(201).json(repository.create(result.value));
  });

  return router;
}

export default createOrdersRouter();
