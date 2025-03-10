const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/user.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { setupTestDB, createTestUser, mockStripeService } = require('./utils/testSetup');

setupTestDB();
mockStripeService();

describe('Billing Endpoints', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await createTestUser(User);
    token = user.getSignedJwtToken();
  });

  describe('GET /api/billing/plans', () => {
    it('should get subscription plans', async () => {
      const res = await request(app)
        .get('/api/billing/plans');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('free');
      expect(res.body.data).toHaveProperty('basic');
      expect(res.body.data).toHaveProperty('premium');
    });

    it('should include plan features and pricing', async () => {
      const res = await request(app)
        .get('/api/billing/plans');

      const plans = res.body.data;
      ['free', 'basic', 'premium'].forEach(plan => {
        expect(plans[plan]).toHaveProperty('name');
        expect(plans[plan]).toHaveProperty('price');
        expect(plans[plan]).toHaveProperty('features');
        expect(plans[plan].features).toBeInstanceOf(Array);
      });
    });
  });

  describe('POST /api/billing/subscribe', () => {
    const validSubscriptionData = {
      planId: 'basic',
      paymentMethodId: 'pm_test_123'
    };

    it('should create new subscription', async () => {
      const res = await request(app)
        .post('/api/billing/subscribe')
        .set('Authorization', `Bearer ${token}`)
        .send(validSubscriptionData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('subscriptionId');
      expect(res.body.data).toHaveProperty('clientSecret');

      // Verify user subscription was updated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.subscription.type).toBe('basic');
      expect(updatedUser.subscription.status).toBe('active');
    });

    it('should handle invalid plan selection', async () => {
      const res = await request(app)
        .post('/api/billing/subscribe')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...validSubscriptionData,
          planId: 'invalid-plan'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toMatch(/invalid plan/i);
    });

    it('should handle payment method errors', async () => {
      const { subscriptions } = require('stripe');
      subscriptions.create.mockRejectedValueOnce(new Error('Invalid payment method'));

      const res = await request(app)
        .post('/api/billing/subscribe')
        .set('Authorization', `Bearer ${token}`)
        .send(validSubscriptionData);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toMatch(/subscription.*failed/i);
    });
  });

  describe('PUT /api/billing/subscription', () => {
    beforeEach(async () => {
      // Setup existing subscription
      user.subscription = {
        type: 'basic',
        stripeSubscriptionId: 'sub_test_123',
        status: 'active'
      };
      await user.save();
    });

    it('should update subscription plan', async () => {
      const res = await request(app)
        .put('/api/billing/subscription')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: 'premium' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Subscription updated successfully');

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.subscription.type).toBe('premium');
    });

    it('should handle downgrade to basic plan', async () => {
      user.subscription.type = 'premium';
      await user.save();

      const res = await request(app)
        .put('/api/billing/subscription')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: 'basic' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
    });

    it('should validate storage limits when downgrading', async () => {
      user.subscription.type = 'premium';
      user.stats.storageUsed = 50 * 1024 * 1024 * 1024; // 50GB
      await user.save();

      const res = await request(app)
        .put('/api/billing/subscription')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: 'basic' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/storage limit/i);
    });
  });

  describe('DELETE /api/billing/subscription', () => {
    beforeEach(async () => {
      user.subscription = {
        type: 'basic',
        stripeSubscriptionId: 'sub_test_123',
        status: 'active'
      };
      await user.save();
    });

    it('should cancel subscription', async () => {
      const res = await request(app)
        .delete('/api/billing/subscription')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Subscription cancelled successfully');

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.subscription.status).toBe('cancelled');
    });

    it('should handle non-existent subscription', async () => {
      user.subscription.stripeSubscriptionId = null;
      await user.save();

      const res = await request(app)
        .delete('/api/billing/subscription')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/no active subscription/i);
    });
  });

  describe('GET /api/billing/history', () => {
    it('should get billing history', async () => {
      const res = await request(app)
        .get('/api/billing/history')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should format invoice data correctly', async () => {
      const mockInvoices = [
        {
          id: 'inv_test_1',
          created: Math.floor(Date.now() / 1000),
          amount_paid: 999,
          status: 'paid',
          invoice_pdf: 'https://example.com/invoice.pdf'
        }
      ];

      const { invoices } = require('stripe');
      invoices.list.mockResolvedValueOnce({ data: mockInvoices });

      const res = await request(app)
        .get('/api/billing/history')
        .set('Authorization', `Bearer ${token}`);

      expect(res.body.data[0]).toHaveProperty('id', 'inv_test_1');
      expect(res.body.data[0]).toHaveProperty('amount', 9.99);
      expect(res.body.data[0]).toHaveProperty('status', 'paid');
      expect(res.body.data[0]).toHaveProperty('pdf');
    });
  });

  describe('PUT /api/billing/payment-method', () => {
    it('should update payment method', async () => {
      const res = await request(app)
        .put('/api/billing/payment-method')
        .set('Authorization', `Bearer ${token}`)
        .send({ paymentMethodId: 'pm_test_new_123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Payment method updated successfully');
    });

    it('should handle invalid payment method', async () => {
      const { customers } = require('stripe');
      customers.update.mockRejectedValueOnce(new Error('Invalid payment method'));

      const res = await request(app)
        .put('/api/billing/payment-method')
        .set('Authorization', `Bearer ${token}`)
        .send({ paymentMethodId: 'invalid_pm' });

      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/failed to update payment method/i);
    });
  });

  describe('POST /api/billing/webhook', () => {
    it('should handle successful payment webhook', async () => {
      const event = {
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            customer: user.stripeCustomerId,
            lines: {
              data: [{
                period: { end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 }
              }]
            }
          }
        }
      };

      const res = await request(app)
        .post('/api/billing/webhook')
        .set('stripe-signature', 'test_signature')
        .send(event);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('received', true);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.subscription.endDate).toBeDefined();
    });

    it('should handle failed payment webhook', async () => {
      const event = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            customer: user.stripeCustomerId,
            amount_due: 999
          }
        }
      };

      const res = await request(app)
        .post('/api/billing/webhook')
        .set('stripe-signature', 'test_signature')
        .send(event);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('received', true);
    });
  });
});
