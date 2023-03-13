import { Router, Request, Response, NextFunction } from 'express';
import { Stripe } from 'stripe';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

interface SubscriptionResponse extends Stripe.Subscription {}
interface CustomerResponse extends Stripe.Customer {}

const subscriptionsRouter = Router();

export interface PaymentInfo {
    email: string;
    paymentMethodId: string;
    priceId: string;
    username: string;
}

subscriptionsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
    // Assuming req.body is of type any
    const paymentInfo = req.body as PaymentInfo;

    // Unpacking the properties from the paymentInfo object
    const { paymentMethodId, priceId, email, username } = paymentInfo;

    try {
        // Create a new customer in Stripe
        const customer : CustomerResponse = await stripe.customers.create({
            email,
            name: username,
            payment_method: paymentMethodId,
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        // Create a new subscription for the customer
        const subscription : SubscriptionResponse = await stripe.subscriptions.create({
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

export default subscriptionsRouter