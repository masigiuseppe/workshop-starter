// Astrazione di persistenza per i prodotti (smell #3 — DIP/OCP).
// La route dipende dall'interfaccia, non dall'array concreto in src/data/.
// Coerente con la regola di progetto "no DB/ORM": resta in memoria, ma dietro
// un'astrazione sostituibile.

import { Product, NewProduct } from '../types/product';
import { products, getNextId } from '../data/products';

export interface ProductRepository {
  list(): Product[];
  create(input: NewProduct): Product;
}

export const inMemoryProductRepository: ProductRepository = {
  list() {
    return products;
  },
  create(input) {
    const product: Product = { id: getNextId(), ...input };
    products.push(product);
    return product;
  },
};
