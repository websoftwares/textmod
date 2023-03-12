import { Router, Request, Response } from 'express';

const stripe = require('stripe')('sk_test_1234567890'); // Replace with your own secret key

app.post('/api/subscribe', async (req, res) => {
  const { paymentMethodId, priceId, email, name, address } = req.body;

  try {
    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email,
      name,
      address: { line1: address },
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create a new subscription for the customer
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });

    res.send({ success: true });
} catch (err) {
  console.error(err);
  res.status(500).send({ success: false, message: 'An error occurred while processing your payment.' });
}
});
