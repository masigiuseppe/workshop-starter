// Astrazione di persistenza per gli ordini (smell #3 — DIP/OCP).
// La route dipende dall'interfaccia, non dall'array concreto in src/data/.

import { Order, NewOrder } from '../types/order';
import { orders, getNextOrderId } from '../data/orders';

export interface OrderRepository {
  list(): Order[];
  create(input: NewOrder): Order;
}

export const inMemoryOrderRepository: OrderRepository = {
  list() {
    return orders;
  },
  create(input) {
    const order: Order = { id: getNextOrderId(), ...input };
    orders.push(order);
    return order;
  },
};
