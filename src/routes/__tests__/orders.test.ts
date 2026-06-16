import request from 'supertest';
import { createApp } from '../../app';

describe('GET /api/orders', () => {
  it('risponde 200 con un array', async () => {
    const res = await request(createApp()).get('/api/orders');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('rispetta il parametro limit', async () => {
    const res = await request(createApp()).get('/api/orders?page=1&limit=1');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(1);
  });

  it('ritorna 400 per page negativo', async () => {
    const res = await request(createApp()).get('/api/orders?page=-1');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('ritorna 400 per limit negativo', async () => {
    const res = await request(createApp()).get('/api/orders?limit=0');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('POST /api/orders', () => {
  it('crea un ordine con productId e quantity → 201', async () => {
    const res = await request(createApp())
      .post('/api/orders')
      .send({ productId: 1, quantity: 3 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ productId: 1, quantity: 3 });
    expect(typeof res.body.id).toBe('number');
  });

  it('crea un ordine con status opzionale → 201', async () => {
    const res = await request(createApp())
      .post('/api/orders')
      .send({ productId: 2, quantity: 1, status: 'pending' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
  });

  it('ritorna 400 se productId manca', async () => {
    const res = await request(createApp())
      .post('/api/orders')
      .send({ quantity: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('ritorna 400 se productId non è un intero positivo', async () => {
    const res = await request(createApp())
      .post('/api/orders')
      .send({ productId: -1, quantity: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('ritorna 400 se quantity manca', async () => {
    const res = await request(createApp())
      .post('/api/orders')
      .send({ productId: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('ritorna 400 se quantity non è un intero positivo', async () => {
    const res = await request(createApp())
      .post('/api/orders')
      .send({ productId: 1, quantity: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('ritorna 400 se status non è una stringa', async () => {
    const res = await request(createApp())
      .post('/api/orders')
      .send({ productId: 1, quantity: 1, status: 42 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
