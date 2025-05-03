import request from 'supertest';
import app from '../src/index';

describe('Test Run', () => {
  it('should pass simple test', () => {
    expect(1 + 1).toBe(2);
  });
});
