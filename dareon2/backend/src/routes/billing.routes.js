const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPlans,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getBillingHistory,
  updatePaymentMethod,
  handleWebhook
} = require('../controllers/billing.controller');

// Stripe webhook - needs raw body for signature verification
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Protected routes
router.use(protect);

// Get subscription plans
router.get('/plans', getPlans);

// Subscription management
router.post('/subscribe', createSubscription);
router.put('/subscription', updateSubscription);
router.delete('/subscription', cancelSubscription);

// Billing history
router.get('/history', getBillingHistory);

// Payment method management
router.put('/payment-method', updatePaymentMethod);

// Admin only routes
router.use(authorize('admin'));

// @desc    Get all subscriptions
// @route   GET /api/billing/subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      status: 'active'
    });

    res.status(200).json({
      success: true,
      count: subscriptions.data.length,
      data: subscriptions.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error retrieving subscriptions'
    });
  }
});

// @desc    Get subscription metrics
// @route   GET /api/billing/metrics
router.get('/metrics', async (req, res) => {
  try {
    const [subscriptions, customers, invoices] = await Promise.all([
      stripe.subscriptions.list({ limit: 100, status: 'active' }),
      stripe.customers.list({ limit: 100 }),
      stripe.invoices.list({ limit: 100, status: 'paid' })
    ]);

    const metrics = {
      activeSubscriptions: subscriptions.data.length,
      totalCustomers: customers.data.length,
      monthlyRecurringRevenue: calculateMRR(subscriptions.data),
      revenueByPlan: calculateRevenueByPlan(subscriptions.data),
      churnRate: calculateChurnRate(subscriptions.data),
      averageRevenuePerUser: calculateARPU(invoices.data)
    };

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error retrieving metrics'
    });
  }
});

// Helper functions for metrics calculations
function calculateMRR(subscriptions) {
  return subscriptions.reduce((total, sub) => {
    return total + (sub.items.data[0].price.unit_amount * sub.items.data[0].quantity) / 100;
  }, 0);
}

function calculateRevenueByPlan(subscriptions) {
  return subscriptions.reduce((acc, sub) => {
    const planName = sub.items.data[0].price.nickname || 'unknown';
    const amount = (sub.items.data[0].price.unit_amount * sub.items.data[0].quantity) / 100;
    acc[planName] = (acc[planName] || 0) + amount;
    return acc;
  }, {});
}

function calculateChurnRate(subscriptions) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  
  const cancelledInLast30Days = subscriptions.filter(sub => {
    const cancelDate = new Date(sub.canceled_at * 1000);
    return cancelDate > thirtyDaysAgo;
  }).length;

  return (cancelledInLast30Days / subscriptions.length) * 100;
}

function calculateARPU(invoices) {
  if (invoices.length === 0) return 0;
  
  const totalRevenue = invoices.reduce((total, invoice) => {
    return total + invoice.amount_paid / 100;
  }, 0);

  const uniqueCustomers = new Set(invoices.map(invoice => invoice.customer)).size;
  
  return totalRevenue / uniqueCustomers;
}

// @desc    Get customer details
// @route   GET /api/billing/customers/:customerId
router.get('/customers/:customerId', async (req, res) => {
  try {
    const customer = await stripe.customers.retrieve(req.params.customerId, {
      expand: ['subscriptions', 'invoices']
    });

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error retrieving customer details'
    });
  }
});

// @desc    Update customer subscription
// @route   PUT /api/billing/customers/:customerId/subscription
router.put('/customers/:customerId/subscription', async (req, res) => {
  try {
    const { subscriptionId, priceId } = req.body;

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscriptionId,
        price: priceId
      }],
      proration_behavior: 'create_prorations'
    });

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error updating customer subscription'
    });
  }
});

module.exports = router;
