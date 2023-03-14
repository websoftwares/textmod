import ServiceBusConnectionManager from "../index";
import Subscription, {createSubscription, updateSubscription, UpdateSubscriptionParams, CreateSubscriptionParams, getSubscription, SubscriptionQueryParams, CreateSubscriptionResult } from '../../textmod-subscriptions/index'

const connectionString = process.env.AZ_SB_CONNECTION_STRING_CREATE_USER_SUBSCRIPTION as string
const queueName = 'create_user_subscription'
const queueManager = new ServiceBusConnectionManager(connectionString);

const processMessage = async () => {
    const receiver = await queueManager.createReceiver(queueName, async (message) => {

        
        const subscription = JSON.parse(message.body) as Subscription
        const subscriptionQueryParams : SubscriptionQueryParams = {
            stripeCustomerId: subscription.stripeCustomerId, 
            stripeSubscriptionId: subscription.stripeSubscriptionId, 
            userId: subscription.userId
        }
        try {
            const existingSubscription = await getSubscription(subscriptionQueryParams)
            // Only run if not exists
            if(!existingSubscription) {
                const result : CreateSubscriptionResult = await createSubscription(subscription as CreateSubscriptionParams)
                console.log(`Succesfully created subscription with id: ${result.id}`)
                await receiver.completeMessage(message)
            }

        } catch(err) {
            await receiver.abandonMessage(message);
            const error = err as Error
            console.log(`Error processing correlationId: ${message.correlationId}: ${error.message}`)
        }
      });
      console.log('Receiver listening for messages...');
}

processMessage()