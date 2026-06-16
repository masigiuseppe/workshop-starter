import { Router } from 'express';
import { products, getNextId } from '../data/products';
import { Product, NewProduct } from '../types/product';

const router = Router();

// ---------------------------------------------------------------------------
// TODO (Lab 1 · Parte A): implement GET /api/products
//
// Posiziona il cursore qui sotto e inizia a digitare:
//
//   router.get('/', async (req, res) => {
//
// Copilot proporrà il corpo come ghost text: premi Tab per accettare,
// Alt+] per ciclare tra le alternative.
// (Parte B) Poi seleziona il corpo e con Ctrl+I aggiungi la validazione
// dei query param page/limit.


// ---------------------------------------------------------------------------
// TODO (Lab 1 · Parte C): implement POST /api/products
//
// Apri la Chat (Ctrl+Alt+I) e chiedi a Copilot di generarlo:
//   body: name (string, required), price (number, required),
//         category (string, optional). Validazione con Zod o manuale.
//   Risposte: 201 con il prodotto creato, 400 se la validazione fallisce.


export default router;

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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page < 1 || limit < 1) {
        return res.status(400).json({ error: 'page and limit must be positive integers' });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProducts = products.slice(startIndex, endIndex);
    return res.json(paginatedProducts);
});

/**
 * POST /api/products
 *
 * Creates a new product and appends it to the in-memory store.
 *
 * @body name     {string}  Required. Non-empty name of the product.
 * @body price    {number}  Required. Finite numeric price of the product.
 * @body category {string}  Optional. Category label for the product.
 *
 * @returns 201 - The newly created Product object (including generated `id`).
 * @returns 400 - If `name` is missing/empty, `price` is not a finite number,
 *                or `category` is provided but is not a string.
 */
router.post('/', async (req, res) => {
    const { name, price, category } = req.body as Partial<NewProduct>;

    const isNameValid = typeof name === 'string' && name.trim().length > 0;
    const isPriceValid = typeof price === 'number' && Number.isFinite(price);
    const isCategoryValid = category === undefined || typeof category === 'string';

    if (!isNameValid || !isPriceValid || !isCategoryValid) {
        return res.status(400).json({
            error: 'Validation failed',
            details: {
                name: 'name must be a non-empty string',
                price: 'price must be a valid number',
                category: 'category must be a string when provided',
            },
        });
    }

    const newProduct: Product = {
        id: getNextId(),
        name: name.trim(),
        price,
        ...(category !== undefined ? { category } : {}),
    };

    products.push(newProduct);
    return res.status(201).json(newProduct);
});