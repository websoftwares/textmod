import { Router, Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { queueManagerSenderFactory } from '../textmod-queue';
import { User, getUserByEmail, insertUserAsync, generateSecurePassword } from '../textmod-users';
import { randomUUID } from 'crypto';
import { CreateSubscriptionParams } from "./index"

interface SubscriptionResponse extends Stripe.Subscription { }
interface CustomerResponse extends Stripe.Customer { }

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const subscriptionsWebhookRouter = Router();

subscriptionsWebhookRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {

  const id = req.body?.data?.object?.id ?? undefined;
  if (id === undefined) {
    const error = new Error(`[/webhook/subscriptions] id property does not exist on request body data object`);
    return next(error);
  }

  const event = req.body;

  if (event.type === 'customer.subscription.created') {

    try {
      // Retrieve the subscription from Stripe
      const subscription: SubscriptionResponse = await stripe.subscriptions.retrieve(id);

      if (!subscription.customer) {
        return next(new Error(`[/webhook/subscriptions] Subscription ${subscription.id} is missing customer information.`));
      }

      const customer: CustomerResponse = await stripe.customers.retrieve(subscription.customer);

      if (!customer.name || !customer.email) {
        return next(new Error(`[/webhook/subscriptions] Customer ${customer.id} is missing name or email information. Skipping registration.`));
      }

      // send to queue for user register
      const user = {
        username: customer.name,
        email: customer.email,
      } as User;

      // do user registration
      const existingUser = await getUserByEmail(user.email);

      if (existingUser) {
        user.id = existingUser.id
        user.password = existingUser.password
      } else {
        // create user
        user.password = generateSecurePassword(10)
        try {
          const { id, password } = await insertUserAsync(user)
          user.id = id
          user.password = password
        } catch (err) {
          const error = err as Error
          return next(new Error(`[/webhook/subscriptions] Failed to insert user ${user.email}: ${error.message}`));
        }
      }

      const createSubscriptionParams: CreateSubscriptionParams = {
        userId: user.id, // Assuming that the Stripe customer ID is the user ID in your system
        stripeCustomerId: customer.id,
        startDate: new Date(subscription.start_date * 1000), // Convert Unix timestamp to JavaScript Date object
        endDate: new Date(subscription.current_period_end * 1000), // Convert Unix timestamp to JavaScript Date object
        status: subscription.status as "active" | "canceled" | undefined,
        stripeSubscriptionId: subscription.id,
      };

      try {
        const sender = await queueManagerSenderFactory(process.env.AZ_SB_CONNECTION_STRING_CREATE_USER_SUBSCRIPTION as string, 'create_user_subscription')
        sender.sendMessages({
          body: JSON.stringify(createSubscriptionParams),
          correlationId: randomUUID(),
          contentType: 'application/json',
          subject: `Create user ${user.email} subscription: ${subscription.id}`
        })
      } catch (err) {
        const error = err as Error
        console.log(err)
        return next(new Error(`[/webhook/subscriptions] Failed to enqueue create user subscription: ${error.message}`));
      }

      try {
      } catch (err) {
        const error = err as Error
        return next(new Error(`[/webhook/subscriptions] Failed to register user ${user.email}: ${error.message}`));
      }



    } catch (err) {
      const error = err as Error
      console.error(`[/webhook/subscriptions] Failed to retrieve subscription or customer: ${error.message}`);
      return next(err);
    }

  }

  if (event.type === 'customer.subscription.updated') {
    // // Retrieve the subscription from Stripe
    // const subscription: SubscriptionResponse = await stripe.subscriptions.retrieve(id);
    // // console.log(subscription)
    // console.log(`Subscription ${subscription.id} updated`);
  }

  if (event.type === 'customer.subscription.deleted') {
    // // Retrieve the subscription from Stripe
    // const subscription: SubscriptionResponse = await stripe.subscriptions.retrieve(id);
    // // console.log(subscription)
    // console.log(`Subscription ${subscription.id} updated`);
  }

  if (event.type === 'invoice.payment_failed') { }

  if (event.type === 'invoice.payment_succeeded') { }

  res.sendStatus(200);
});


export default subscriptionsWebhookRouter