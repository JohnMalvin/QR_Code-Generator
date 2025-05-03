import request from 'supertest';
import app from './../src/index'; // Import the Express app

describe('POST /generate/QRCode/:API/:APIKEY', () => {
  it('should return 401 if missing data, API, or APIKEY', async () => {
    const response = await request(app).post('/generate/QRCode/123/xyz').send({});
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Missing data, API, or APIKEY');
  });

  it('should return 400 for invalid data format', async () => {
    const invalidData = { URL: 'https://www.example.com', backgroundColor: 'invalid', fillColor: 'invalid' };
    const response = await request(app)
      .post('/generate/QRCode/123/xyz')
      .send({ data: invalidData });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid data format');
  });

  it('should return 402 if API is not registered', async () => {
    const validData = { URL: 'https://www.example.com', backgroundColor: '255,255,255', fillColor: '0,0,0' };
    const response = await request(app)
      .post('/generate/QRCode/invalidAPI/xyz')
      .send({ data: validData });
    
    expect(response.status).toBe(402);
    expect(response.body.error).toBe('API is not registered');
  });

  it('should return 200 and success response if everything is valid', async () => {
    const validData = { URL: 'https://www.example.com', backgroundColor: '255,255,255', fillColor: '0,0,0' };
    const response = await request(app)
      .post('/generate/QRCode/validAPI/validAPIKEY')
      .send({ data: validData });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should return 500 if there is an internal server error', async () => {
    const validData = { URL: 'https://www.example.com', backgroundColor: '255,255,255', fillColor: '0,0,0' };
    const response = await request(app)
      .post('/generate/QRCode/validAPI/validAPIKEY')
      .send({ data: validData });
    
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal server error');
  });
});
