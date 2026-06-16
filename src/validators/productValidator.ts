// Validazione di dominio per i prodotti (smell #2 — SRP).
// Separa la regola di validazione dal layer HTTP: restituisce il NewProduct
// normalizzato (name trimmato, category omessa se assente) oppure l'errore.

import { NewProduct } from '../types/product';
import { collectValidationErrors, ValidationResult } from '../lib/validation';

export function validateNewProduct(
  body: Partial<NewProduct>,
): ValidationResult<NewProduct> {
  const { name, price, category } = body;

  const error = collectValidationErrors({
    name: {
      valid: typeof name === 'string' && name.trim().length > 0,
      message: 'name must be a non-empty string',
    },
    price: {
      valid: typeof price === 'number' && Number.isFinite(price),
      message: 'price must be a valid number',
    },
    category: {
      valid: category === undefined || typeof category === 'string',
      message: 'category must be a string when provided',
    },
  });

  if (error) {
    return { error };
  }

  return {
    value: {
      name: (name as string).trim(),
      price: price as number,
      ...(category !== undefined ? { category } : {}),
    },
  };
}
