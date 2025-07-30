const express = require('express');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Mock payment processing (integrate with real payment gateways)
router.use(authenticate);

// Create payment intent
router.post('/create-intent', asyncHandler(async (req, res) => {
  const { amount, currency = 'USD', paymentMethod } = req.body;
  
  // Mock payment intent creation
  const paymentIntent = {
    id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: amount,
    currency: currency.toLowerCase(),
    status: 'requires_payment_method',
    client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 16)}`,
    created: new Date().toISOString(),
    payment_method: paymentMethod
  };

  res.json({
    success: true,
    message: 'Payment intent created successfully',
    data: { paymentIntent }
  });
}));

// Confirm payment
router.post('/confirm', asyncHandler(async (req, res) => {
  const { paymentIntentId, paymentMethodId } = req.body;
  
  // Mock payment confirmation
  const confirmed = Math.random() > 0.1; // 90% success rate for demo
  
  if (confirmed) {
    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        paymentIntent: {
          id: paymentIntentId,
          status: 'succeeded',
          amount_received: req.body.amount,
          charges: {
            data: [{
              id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              amount: req.body.amount,
              currency: 'usd',
              status: 'succeeded',
              payment_method: paymentMethodId
            }]
          }
        }
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Payment failed',
      error: {
        type: 'card_error',
        code: 'card_declined',
        decline_code: 'generic_decline'
      }
    });
  }
}));

// Refund payment
router.post('/refund', asyncHandler(async (req, res) => {
  const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;
  
  // Mock refund processing
  const refund = {
    id: `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: amount,
    currency: 'usd',
    status: 'succeeded',
    reason: reason,
    payment_intent: paymentIntentId,
    created: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Refund processed successfully',
    data: { refund }
  });
}));

// Get payment methods
router.get('/methods', asyncHandler(async (req, res) => {
  // Mock payment methods
  const paymentMethods = [
    {
      id: 'pm_card_visa',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2025
      }
    },
    {
      id: 'pm_card_mastercard',
      type: 'card',
      card: {
        brand: 'mastercard',
        last4: '5555',
        exp_month: 8,
        exp_year: 2024
      }
    }
  ];

  res.json({
    success: true,
    data: { paymentMethods }
  });
}));

// Add payment method
router.post('/methods', asyncHandler(async (req, res) => {
  const { type, card } = req.body;
  
  // Mock adding payment method
  const paymentMethod = {
    id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: type,
    [type]: card,
    created: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Payment method added successfully',
    data: { paymentMethod }
  });
}));

// Remove payment method
router.delete('/methods/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Mock payment method removal
  res.json({
    success: true,
    message: 'Payment method removed successfully'
  });
}));

module.exports = router;