import { ServiceBusClient, ServiceBusSender, ServiceBusReceiver, ServiceBusReceivedMessage } from '@azure/service-bus';

export class ServiceBusConnectionManager {
  private readonly connectionString: string;
  private readonly serviceBusClient: ServiceBusClient;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
    this.serviceBusClient = new ServiceBusClient(this.connectionString);
  }

  public async createSender(queueName: string): Promise<ServiceBusSender> {
    return this.serviceBusClient.createSender(queueName);
  }

  public async createReceiver(queueName: string, messageHandler: (message: ServiceBusReceivedMessage) => Promise<void>): Promise<ServiceBusReceiver> {
    const receiver = this.serviceBusClient.createReceiver(queueName, {
      receiveMode: 'peekLock'
    });
    receiver.subscribe({
      processMessage: async (message: ServiceBusReceivedMessage) => {
        await messageHandler(message);
      },
      processError: async (error: any) => {
        console.error('Error while receiving messages:', error);
      }
    });
    return receiver;
  }

  public async close(): Promise<void> {
    await this.serviceBusClient.close();
  }
}
