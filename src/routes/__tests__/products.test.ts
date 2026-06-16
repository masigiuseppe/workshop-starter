import express from 'express';
import request from 'supertest';
import { createApp } from '../../app';
import { createProductsRouter } from '../products';
import { ProductRepository } from '../../repositories/productRepository';

describe('GET /api/products', () => {
  it('risponde 200 con un array', async () => {
    const res = await request(createApp()).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('rispetta il parametro limit', async () => {
    const res = await request(createApp()).get('/api/products?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(2);
  });

  it('should return 400 for negative page number', async () => {
    const res = await request(createApp()).get('/api/products?page=-1&limit=10');
    expect(res.status).toBe(400);
  });

  it('rispetta il parametro page (pagine diverse restituiscono prodotti diversi)', async () => {
    const res1 = await request(createApp()).get('/api/products?page=1&limit=1');
    const res2 = await request(createApp()).get('/api/products?page=2&limit=1');
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    if (res1.body.length > 0 && res2.body.length > 0) {
      expect(res1.body[0].id).not.toBe(res2.body[0].id);
    }
  });
});

describe('POST /api/products', () => {
  it('crea un prodotto con name e price → 201', async () => {
    const res = await request(createApp())
      .post('/api/products')
      .send({ name: 'Test Product', price: 9.99 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Test Product', price: 9.99 });
    expect(typeof res.body.id).toBe('number');
  });

  it('crea un prodotto con category opzionale → 201', async () => {
    const res = await request(createApp())
      .post('/api/products')
      .send({ name: 'Product With Category', price: 19.99, category: 'electronics' });
    expect(res.status).toBe(201);
    expect(res.body.category).toBe('electronics');
  });

  it('ritorna 400 se name manca', async () => {
    const res = await request(createApp())
      .post('/api/products')
      .send({ price: 9.99 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('ritorna 400 se name è stringa vuota', async () => {
    const res = await request(createApp())
      .post('/api/products')
      .send({ name: '   ', price: 9.99 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('ritorna 400 se price manca', async () => {
    const res = await request(createApp())
      .post('/api/products')
      .send({ name: 'No Price' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('ritorna 400 se price non è un numero', async () => {
    const res = await request(createApp())
      .post('/api/products')
      .send({ name: 'Bad Price', price: 'not-a-number' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('ritorna 400 se category non è una stringa', async () => {
    const res = await request(createApp())
      .post('/api/products')
      .send({ name: 'Bad Category', price: 5.0, category: 123 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('details contiene solo i campi effettivamente invalidi', async () => {
    const res = await request(createApp())
      .post('/api/products')
      .send({ name: 'Valid Name' }); // name valido, price mancante
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('price');
    expect(res.body.details).not.toHaveProperty('name');
  });
});

describe('createProductsRouter (dependency injection)', () => {
  it('usa il repository iniettato invece di quello in memoria', async () => {
    const fake: ProductRepository = {
      list: () => [{ id: 99, name: 'Injected', price: 1 }],
      create: (input) => ({ id: 1000, ...input }),
    };
    const app = express();
    app.use(express.json());
    app.use('/api/products', createProductsRouter(fake));

    const list = await request(app).get('/api/products');
    expect(list.body).toEqual([{ id: 99, name: 'Injected', price: 1 }]);

    const created = await request(app)
      .post('/api/products')
      .send({ name: 'New', price: 5 });
    expect(created.status).toBe(201);
    expect(created.body.id).toBe(1000);
  });
});
