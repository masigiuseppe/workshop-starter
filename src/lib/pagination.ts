// Paginazione condivisa per gli endpoint GET di lista.
// Estratta da routes/products.ts e routes/orders.ts per eliminare la
// duplicazione e uniformare la gestione di page/limit tra le route.

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export interface PaginationError {
  error: string;
}

function parseParam(raw: unknown, fallback: number): number {
  const n = parseInt(String(raw), 10);
  return Number.isNaN(n) ? fallback : n;
}

/**
 * Restituisce la porzione paginata di `items` in base ai query param
 * `page`/`limit`.
 *
 * - Parametri assenti o non numerici → default (page 1, limit 10).
 * - `page` o `limit` minori di 1 → `{ error }` (il chiamante risponde 400).
 * - `limit` viene limitato a {@link MAX_LIMIT}.
 *
 * @returns `{ data }` in caso di successo, oppure `{ error }` se i parametri
 *          sono fuori range.
 */
export function paginate<T>(
  items: T[],
  pageRaw: unknown,
  limitRaw: unknown,
): { data: T[] } | PaginationError {
  const page = parseParam(pageRaw, DEFAULT_PAGE);
  const rawLimit = parseParam(limitRaw, DEFAULT_LIMIT);

  if (page < 1 || rawLimit < 1) {
    return { error: 'page and limit must be positive integers' };
  }

  const limit = Math.min(rawLimit, MAX_LIMIT);
  const start = (page - 1) * limit;
  return { data: items.slice(start, start + limit) };
}
