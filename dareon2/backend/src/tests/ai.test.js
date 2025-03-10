const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/user.model');
const { setupTestDB, createTestUser } = require('./utils/testSetup');

setupTestDB();

describe('AI Assistant Endpoints', () => {
  let user;
  let token;

  beforeEach(async () => {
    // Create test user with premium subscription
    user = await createTestUser(User, {
      subscription: {
        type: 'premium',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
    token = user.getSignedJwtToken();
  });

  describe('POST /api/ai/command', () => {
    it('should process sort files command', async () => {
      const res = await request(app)
        .post('/api/ai/command')
        .set('Authorization', `Bearer ${token}`)
        .send({
          command: 'sort my files by type'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('intent', 'sortFiles');
      expect(res.body.data.result).toHaveProperty('message');
      expect(res.body.data.result).toHaveProperty('files');
    });

    it('should process sync emails command', async () => {
      const res = await request(app)
        .post('/api/ai/command')
        .set('Authorization', `Bearer ${token}`)
        .send({
          command: 'sync my outlook emails'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('intent', 'syncEmails');
      expect(res.body.data.result).toHaveProperty('message');
      expect(res.body.data.result).toHaveProperty('results');
    });

    it('should process update calendar command', async () => {
      const res = await request(app)
        .post('/api/ai/command')
        .set('Authorization', `Bearer ${token}`)
        .send({
          command: 'update my calendar'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('intent', 'updateCalendar');
      expect(res.body.data.result).toHaveProperty('message');
      expect(res.body.data.result).toHaveProperty('status');
    });

    it('should handle unknown commands', async () => {
      const res = await request(app)
        .post('/api/ai/command')
        .set('Authorization', `Bearer ${token}`)
        .send({
          command: 'do something impossible'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Could not understand command');
    });

    it('should handle empty commands', async () => {
      const res = await request(app)
        .post('/api/ai/command')
        .set('Authorization', `Bearer ${token}`)
        .send({
          command: ''
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Command is required');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/ai/command')
        .send({
          command: 'sort files by type'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should check subscription level', async () => {
      // Create user with basic subscription
      const basicUser = await createTestUser(User, {
        subscription: {
          type: 'basic',
          status: 'active'
        }
      });
      const basicToken = basicUser.getSignedJwtToken();

      const res = await request(app)
        .post('/api/ai/command')
        .set('Authorization', `Bearer ${basicToken}`)
        .send({
          command: 'analyze my documents'
        });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toMatch(/premium/i);
    });
  });

  describe('GET /api/ai/history', () => {
    it('should get command history', async () => {
      const res = await request(app)
        .get('/api/ai/history')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should paginate command history', async () => {
      const res = await request(app)
        .get('/api/ai/history')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('page', 1);
      expect(res.body.pagination).toHaveProperty('limit', 10);
    });
  });

  describe('GET /api/ai/suggestions', () => {
    it('should get command suggestions', async () => {
      const res = await request(app)
        .get('/api/ai/suggestions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should get context-aware suggestions', async () => {
      const res = await request(app)
        .get('/api/ai/suggestions')
        .query({ context: 'email' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some(suggestion => 
        suggestion.toLowerCase().includes('email')
      )).toBe(true);
    });
  });

  describe('POST /api/ai/analyze', () => {
    it('should analyze file content', async () => {
      const res = await request(app)
        .post('/api/ai/analyze')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fileId: 'test-file-id'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data).toHaveProperty('insights');
      expect(res.body.data).toHaveProperty('recommendations');
    });

    it('should require premium subscription', async () => {
      const basicUser = await createTestUser(User, {
        subscription: {
          type: 'basic',
          status: 'active'
        }
      });
      const basicToken = basicUser.getSignedJwtToken();

      const res = await request(app)
        .post('/api/ai/analyze')
        .set('Authorization', `Bearer ${basicToken}`)
        .send({
          fileId: 'test-file-id'
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/premium/i);
    });
  });

  describe('GET /api/ai/insights', () => {
    it('should get AI insights', async () => {
      const res = await request(app)
        .get('/api/ai/insights')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('fileManagement');
      expect(res.body.data).toHaveProperty('emailPatterns');
      expect(res.body.data).toHaveProperty('calendar');
    });

    it('should require premium subscription', async () => {
      const basicUser = await createTestUser(User, {
        subscription: {
          type: 'basic',
          status: 'active'
        }
      });
      const basicToken = basicUser.getSignedJwtToken();

      const res = await request(app)
        .get('/api/ai/insights')
        .set('Authorization', `Bearer ${basicToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/premium/i);
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limiting', async () => {
      const promises = Array(101).fill().map(() => 
        request(app)
          .post('/api/ai/command')
          .set('Authorization', `Bearer ${token}`)
          .send({
            command: 'sort files'
          })
      );

      const responses = await Promise.all(promises);
      const lastResponse = responses[responses.length - 1];

      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.error).toMatch(/too many requests/i);
    });

    it('should handle service unavailability', async () => {
      // Simulate service being down
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Service unavailable'));

      const res = await request(app)
        .post('/api/ai/command')
        .set('Authorization', `Bearer ${token}`)
        .send({
          command: 'sort files'
        });

      expect(res.status).toBe(503);
      expect(res.body.error).toMatch(/service unavailable/i);
    });
  });
});
