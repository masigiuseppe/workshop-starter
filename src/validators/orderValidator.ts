// Validazione di dominio per gli ordini (smell #2 — SRP).
// Separa la regola di validazione dal layer HTTP: restituisce il NewOrder
// normalizzato (status omesso se assente) oppure l'errore.

import { NewOrder } from '../types/order';
import { collectValidationErrors, ValidationResult } from '../lib/validation';

export function validateNewOrder(
  body: Partial<NewOrder>,
): ValidationResult<NewOrder> {
  const { productId, quantity, status } = body;

  const error = collectValidationErrors({
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

  if (error) {
    return { error };
  }

  return {
    value: {
      productId: productId as number,
      quantity: quantity as number,
      ...(status !== undefined ? { status } : {}),
    },
  };
}
