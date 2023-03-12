import { Router, Request, Response, NextFunction } from 'express';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const subscriptionsWebhookRouter = Router();

subscriptionsWebhookRouter.post('/', async (req, res) => {
    const event = req.body;
    const id = event.data.object.id;
  
    if (event.type === 'customer.subscription.updated') {
      // Retrieve the subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(id);
      console.log(`Subscription ${subscription.id} updated`);
    }

    if (event.type === 'customer.subscription.created') {
        // Retrieve the subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(id);
      }

      if (event.type === 'invoice.payment_failed') {}

      if (event.type === 'invoice.payment_succeeded') {}
  
    res.sendStatus(200);
  });


export default subscriptionsWebhookRouter