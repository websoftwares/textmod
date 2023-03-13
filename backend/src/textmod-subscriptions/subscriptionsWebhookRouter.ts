import { Router, Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { User } from '../textmod-users';

interface SubscriptionResponse extends Stripe.Subscription {}
interface CustomerResponse extends Stripe.Customer {}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const subscriptionsWebhookRouter = Router();

subscriptionsWebhookRouter.post('/', async (req : Request, res : Response, next : NextFunction) => {
    const event = req.body;
    const id = event.data.object.id;

    if (event.type === 'customer.subscription.created') {
        // Retrieve the subscription from Stripe
        const subscription : SubscriptionResponse = await stripe.subscriptions.retrieve(id);
        const customer : CustomerResponse = await stripe.customers.retrieve(subscription.customer)
        
        // send to queue for user register
        const user = {
          username: customer.name ?? 'BORIS CLAUS VERHAAFF',
          email: customer.email ?? 'boris@c4rex.dev',
        } as User



        console.log(`Subscription ${subscription.id} updated`);
      }
  
    if (event.type === 'customer.subscription.updated') {
      // Retrieve the subscription from Stripe
      const subscription : SubscriptionResponse = await stripe.subscriptions.retrieve(id);
      // console.log(subscription)
      console.log(`Subscription ${subscription.id} updated`);
    }

    if (event.type === 'customer.subscription.created') {
        // Retrieve the subscription from Stripe
        const subscription : SubscriptionResponse = await stripe.subscriptions.retrieve(id);
        // console.log(subscription)
        console.log(`Subscription ${subscription.id} updated`);
      }

      if (event.type === 'invoice.payment_failed') {}

      if (event.type === 'invoice.payment_succeeded') {}
  
    res.sendStatus(200);
  });


export default subscriptionsWebhookRouter