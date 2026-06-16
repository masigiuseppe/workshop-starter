// Modello dati per gli ordini.
export interface Order {
  id: number;
  productId: number;
  quantity: number;
  status?: string;
}

// Payload di creazione (senza id, generato dal server).
export type NewOrder = Omit<Order, 'id'>;
