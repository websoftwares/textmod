import tape from "tape";
import { ServiceBusConnectionManager } from "../../src/textmod-queue/index";


(async () => {
  const connectionString = ''
  const queueName = 'test'
  
  const queueManager = new ServiceBusConnectionManager(connectionString);

  try {
    // Send a message to the queue
    const sender = await queueManager.createSender(queueName);
    const message = {
      body: 'Hello, Azure Service Bus!',
      label: 'Greeting',
      userProperties: {
        myCustomProperty: 'my custom value'
      }
    };
    await sender.sendMessages(message);
    console.log('Message sent successfully');

    // Receive messages from the queue
    const receiver = await queueManager.createReceiver(queueName, async (message) => {
      console.log(`Received message with body "${message.body}"`);
      await receiver.abandonMessage(message);
    });
    console.log('Receiver listening for messages...');

    // Wait for messages to be received
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Close the connection to Azure Service Bus
    await queueManager.close();
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();