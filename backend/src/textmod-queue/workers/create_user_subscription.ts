import ServiceBusConnectionManager from "../index";
import Subscription, {createSubscription, updateSubscription, UpdateSubscriptionParams, CreateSubscriptionParams, getSubscription, SubscriptionQueryParams } from '../../textmod-subscriptions/index'

const connectionString = process.env.AZ_SB_CONNECTION_STRING_CREATE_USER_SUBSCRIPTION as string
const queueName = 'create_user_subscription'
const queueManager = new ServiceBusConnectionManager(connectionString);

const processMessage = async () => {
    const receiver = await queueManager.createReceiver(queueName, async (message) => {
        console.log(`Received message with body "${message.body}"`);
        console.log(`CorrelationId: ${message.correlationId}`)

        
        const subscription = JSON.parse(message.body) as Subscription
        const 

        console.log(subscription)


        await receiver.abandonMessage(message);
      });
      console.log('Receiver listening for messages...');
}

processMessage()