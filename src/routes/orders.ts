import { Router } from 'express';
import { orders, getNextOrderId } from '../data/orders';
import { Order, NewOrder } from '../types/order';

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
  const page = parseInt(req.query.page as string) || 1;
  const limitRaw = parseInt(req.query.limit as string);
  const limit = Number.isNaN(limitRaw) ? 10 : limitRaw;

  if (page < 1 || limit < 1) {
    return res.status(400).json({ error: 'page and limit must be positive integers' });
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  return res.json(orders.slice(startIndex, endIndex));
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

  const isProductIdValid = typeof productId === 'number' && Number.isInteger(productId) && productId > 0;
  const isQuantityValid = typeof quantity === 'number' && Number.isInteger(quantity) && quantity > 0;
  const isStatusValid = status === undefined || typeof status === 'string';

  if (!isProductIdValid || !isQuantityValid || !isStatusValid) {
    return res.status(400).json({
      error: 'Validation failed',
      details: {
        productId: 'productId must be a positive integer',
        quantity: 'quantity must be a positive integer',
        status: 'status must be a string when provided',
      },
    });
  }

  const newOrder: Order = {
    id: getNextOrderId(),
    productId,
    quantity,
    ...(status !== undefined ? { status } : {}),
  };

  orders.push(newOrder);
  return res.status(201).json(newOrder);
});

export default router;
