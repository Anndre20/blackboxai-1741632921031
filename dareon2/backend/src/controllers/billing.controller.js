const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/user.model');
const logger = require('../utils/logger');
const emailService = require('../utils/email');

class BillingController {
  // @desc    Get subscription plans
  // @route   GET /api/billing/plans
  // @access  Public
  getPlans = asyncHandler(async (req, res) => {
    const plans = {
      free: {
        name: 'Free Trial',
        price: 0,
        duration: '14 days',
        features: [
          'Basic file management',
          'Up to 1GB storage',
          'Email integration',
          'Calendar sync'
        ]
      },
      basic: {
        name: 'Basic Plan',
        price: 9.99,
        duration: 'monthly',
        features: [
          'Advanced file management',
          'Up to 10GB storage',
          'Email & calendar integration',
          'Basic AI features',
          'Priority support'
        ]
      },
      premium: {
        name: 'Premium Plan',
        price: 29.99,
        duration: 'monthly',
        features: [
          'Enterprise file management',
          'Up to 100GB storage',
          'Full integration suite',
          'Advanced AI features',
          '24/7 Priority support',
          'Custom API access'
        ]
      }
    };

    res.status(200).json({
      success: true,
      data: plans
    });
  });

  // @desc    Create subscription
  // @route   POST /api/billing/subscribe
  // @access  Private
  createSubscription = asyncHandler(async (req, res) => {
    const { planId, paymentMethodId } = req.body;
    const user = req.user;

    // Validate plan
    if (!['basic', 'premium'].includes(planId)) {
      throw new ErrorResponse('Invalid plan selected', 400);
    }

    try {
      // Create or get Stripe customer
      let customer;
      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          payment_method: paymentMethodId,
          invoice_settings: {
            default_payment_method: paymentMethodId
          }
        });

        // Save Stripe customer ID
        user.stripeCustomerId = customer.id;
        await user.save();
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: process.env[`STRIPE_${planId.toUpperCase()}_PRICE_ID`] }],
        expand: ['latest_invoice.payment_intent']
      });

      // Update user subscription
      user.subscription = {
        type: planId,
        stripeSubscriptionId: subscription.id,
        startDate: new Date(),
        endDate: new Date(subscription.current_period_end * 1000),
        status: 'active'
      };
      await user.save();

      // Send confirmation email
      await emailService.sendEmail({
        email: user.email,
        subject: 'Subscription Confirmation',
        template: 'subscriptionConfirmation',
        data: {
          name: user.firstName,
          plan: planId,
          startDate: new Date().toLocaleDateString(),
          amount: planId === 'basic' ? '$9.99' : '$29.99'
        }
      });

      logger.info({
        type: 'SUBSCRIPTION_CREATED',
        userId: user.id,
        plan: planId,
        subscriptionId: subscription.id
      });

      res.status(200).json({
        success: true,
        data: {
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice.payment_intent.client_secret
        }
      });
    } catch (error) {
      logger.error({
        type: 'SUBSCRIPTION_ERROR',
        userId: user.id,
        error: error.message
      });
      throw new ErrorResponse('Subscription creation failed', 500);
    }
  });

  // @desc    Update subscription
  // @route   PUT /api/billing/subscription
  // @access  Private
  updateSubscription = asyncHandler(async (req, res) => {
    const { planId } = req.body;
    const user = req.user;

    if (!user.subscription.stripeSubscriptionId) {
      throw new ErrorResponse('No active subscription found', 404);
    }

    try {
      const subscription = await stripe.subscriptions.retrieve(
        user.subscription.stripeSubscriptionId
      );

      // Update subscription
      await stripe.subscriptions.update(subscription.id, {
        items: [{
          id: subscription.items.data[0].id,
          price: process.env[`STRIPE_${planId.toUpperCase()}_PRICE_ID`]
        }],
        proration_behavior: 'always_invoice'
      });

      // Update user subscription
      user.subscription.type = planId;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Subscription updated successfully'
      });
    } catch (error) {
      logger.error({
        type: 'SUBSCRIPTION_UPDATE_ERROR',
        userId: user.id,
        error: error.message
      });
      throw new ErrorResponse('Subscription update failed', 500);
    }
  });

  // @desc    Cancel subscription
  // @route   DELETE /api/billing/subscription
  // @access  Private
  cancelSubscription = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user.subscription.stripeSubscriptionId) {
      throw new ErrorResponse('No active subscription found', 404);
    }

    try {
      await stripe.subscriptions.del(user.subscription.stripeSubscriptionId);

      // Update user subscription
      user.subscription.status = 'cancelled';
      user.subscription.endDate = new Date();
      await user.save();

      // Send cancellation email
      await emailService.sendEmail({
        email: user.email,
        subject: 'Subscription Cancelled',
        template: 'subscriptionCancellation',
        data: {
          name: user.firstName
        }
      });

      res.status(200).json({
        success: true,
        message: 'Subscription cancelled successfully'
      });
    } catch (error) {
      logger.error({
        type: 'SUBSCRIPTION_CANCELLATION_ERROR',
        userId: user.id,
        error: error.message
      });
      throw new ErrorResponse('Subscription cancellation failed', 500);
    }
  });

  // @desc    Get billing history
  // @route   GET /api/billing/history
  // @access  Private
  getBillingHistory = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user.stripeCustomerId) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    try {
      const invoices = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 12
      });

      const billingHistory = invoices.data.map(invoice => ({
        id: invoice.id,
        date: new Date(invoice.created * 1000),
        amount: invoice.amount_paid / 100,
        status: invoice.status,
        pdf: invoice.invoice_pdf
      }));

      res.status(200).json({
        success: true,
        data: billingHistory
      });
    } catch (error) {
      logger.error({
        type: 'BILLING_HISTORY_ERROR',
        userId: user.id,
        error: error.message
      });
      throw new ErrorResponse('Failed to retrieve billing history', 500);
    }
  });

  // @desc    Update payment method
  // @route   PUT /api/billing/payment-method
  // @access  Private
  updatePaymentMethod = asyncHandler(async (req, res) => {
    const { paymentMethodId } = req.body;
    const user = req.user;

    if (!user.stripeCustomerId) {
      throw new ErrorResponse('No customer account found', 404);
    }

    try {
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      res.status(200).json({
        success: true,
        message: 'Payment method updated successfully'
      });
    } catch (error) {
      logger.error({
        type: 'PAYMENT_METHOD_UPDATE_ERROR',
        userId: user.id,
        error: error.message
      });
      throw new ErrorResponse('Failed to update payment method', 500);
    }
  });

  // @desc    Handle Stripe webhook
  // @route   POST /api/billing/webhook
  // @access  Public
  handleWebhook = asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      logger.error({
        type: 'WEBHOOK_SIGNATURE_ERROR',
        error: err.message
      });
      throw new ErrorResponse(`Webhook Error: ${err.message}`, 400);
    }

    // Handle the event
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.handleSuccessfulPayment(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleFailedPayment(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCancelled(event.data.object);
        break;
    }

    res.status(200).json({ received: true });
  });

  // Helper methods for webhook handling
  async handleSuccessfulPayment(invoice) {
    const user = await User.findOne({ stripeCustomerId: invoice.customer });
    if (!user) return;

    // Update subscription end date
    user.subscription.endDate = new Date(invoice.lines.data[0].period.end * 1000);
    await user.save();

    // Send success email
    await emailService.sendEmail({
      email: user.email,
      subject: 'Payment Successful',
      template: 'paymentSuccess',
      data: {
        name: user.firstName,
        amount: invoice.amount_paid / 100,
        date: new Date().toLocaleDateString()
      }
    });
  }

  async handleFailedPayment(invoice) {
    const user = await User.findOne({ stripeCustomerId: invoice.customer });
    if (!user) return;

    // Send failure email
    await emailService.sendEmail({
      email: user.email,
      subject: 'Payment Failed',
      template: 'paymentFailed',
      data: {
        name: user.firstName,
        amount: invoice.amount_due / 100
      }
    });
  }

  async handleSubscriptionCancelled(subscription) {
    const user = await User.findOne({
      'subscription.stripeSubscriptionId': subscription.id
    });
    if (!user) return;

    user.subscription.status = 'cancelled';
    user.subscription.endDate = new Date();
    await user.save();

    // Send cancellation email
    await emailService.sendEmail({
      email: user.email,
      subject: 'Subscription Cancelled',
      template: 'subscriptionCancelled',
      data: {
        name: user.firstName
      }
    });
  }
}

module.exports = new BillingController();
