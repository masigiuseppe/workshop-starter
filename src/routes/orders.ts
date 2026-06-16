import { Router } from 'express';
import { orders, getNextOrderId } from '../data/orders';
import { Order, NewOrder } from '../types/order';
import { paginate } from '../lib/pagination';
import { collectValidationErrors } from '../lib/validation';

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
  const result = paginate(orders, req.query.page, req.query.limit);
  if ('error' in result) {
    return res.status(400).json(result);
  }
  return res.json(result.data);
});

/**
 * POST /api/orders
 *
 * Creates a new order and appends it to the in-memory store.
 *
 * @body productId {number}  Required. ID of the product being ordered.
 * @body quantity  {number}  Required. Positive integer quantity.
 * @body status    {string}  Optional. Order status (e.g. 'pending', 'completed').
 *
 * @returns 201 - The newly created Order object (including generated `id`).
 * @returns 400 - If `productId` or `quantity` are invalid, or `status` is not a string.
 */
router.post('/', async (req, res) => {
  const { productId, quantity, status } = req.body as Partial<NewOrder>;

  const validationError = collectValidationErrors({
    productId: {
      valid: typeof productId === 'number' && Number.isInteger(productId) && productId > 0,
      message: 'productId must be a positive integer',
    },
    quantity: {
      valid: typeof quantity === 'number' && Number.isInteger(quantity) && quantity > 0,
      message: 'quantity must be a positive integer',
    },
    status: {
      valid: status === undefined || typeof status === 'string',
      message: 'status must be a string when provided',
    },
  });

  if (validationError) {
    return res.status(400).json(validationError);
  }

  const newOrder: Order = {
    id: getNextOrderId(),
    productId: productId as number,
    quantity: quantity as number,
    ...(status !== undefined ? { status } : {}),
  };

  orders.push(newOrder);
  return res.status(201).json(newOrder);
});

export default router;
