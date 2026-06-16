import { Router } from 'express';
import { NewProduct } from '../types/product';
import { paginate } from '../lib/pagination';
import { validateNewProduct } from '../validators/productValidator';
import {
  ProductRepository,
  inMemoryProductRepository,
} from '../repositories/productRepository';

/**
 * Costruisce il router dei prodotti.
 *
 * Il repository è iniettabile (default: implementazione in memoria) così la
 * route dipende dall'astrazione, non dallo store concreto. Gli handler si
 * limitano a orchestrare: paginazione/validazione e persistenza vivono altrove.
 */
export function createProductsRouter(
  repository: ProductRepository = inMemoryProductRepository,
): Router {
  const router = Router();

  /**
   * GET /api/products
   *
   * Returns a paginated list of all products.
   *
   * @query page  - Page number (default: 1). Must be a positive integer.
   * @query limit - Number of items per page (default: 10). Must be a positive integer.
   *
   * @returns 200 - Array of Product objects for the requested page.
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
   * POST /api/products
   *
   * Creates a new product and appends it to the store.
   *
   * @body name     {string}  Required. Non-empty name of the product.
   * @body price    {number}  Required. Finite numeric price of the product.
   * @body category {string}  Optional. Category label for the product.
   *
   * @returns 201 - The newly created Product object (including generated `id`).
   * @returns 400 - If validation fails (see `details` for the offending fields).
   */
  router.post('/', async (req, res) => {
    const result = validateNewProduct(req.body as Partial<NewProduct>);
    if ('error' in result) {
      return res.status(400).json(result.error);
    }
    return res.status(201).json(repository.create(result.value));
  });

  return router;
}

export default createProductsRouter();
