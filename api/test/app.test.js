const request = require('supertest');
const app = require('../app');  // doğru app dosyasını referans gösterin

describe('GET /api/hello', () => {
  it('should return Hello, world!', async () => {
    const res = await request(app).get('/api/hello');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello, world!');
  });
});
