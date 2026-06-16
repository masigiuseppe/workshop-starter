import { Order } from '../types/order';

// Store in memoria per gli ordini.
// I dati si resettano a ogni riavvio del server.
export const orders: Order[] = [
  { id: 1, productId: 1, quantity: 2, status: 'pending' },
  { id: 2, productId: 3, quantity: 1, status: 'completed' },
];

// Restituisce il prossimo id disponibile.
export function getNextOrderId(): number {
  return orders.length ? Math.max(...orders.map((o) => o.id)) + 1 : 1;
}
