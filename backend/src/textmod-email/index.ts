import { EmailClient, EmailMessage } from '@azure/communication-email';

export class EmailSendConnectionManager {
  private emailClient: EmailClient;

  constructor(private readonly connectionString: string) {
    this.emailClient = new EmailClient(connectionString);
  }

  public async sendEmail(email : EmailMessage): Promise<void> {
    try {
      await this.emailClient.beginSend(email);
      console.log(`Email sent successfully!`);
    } catch (error) {
      console.error(`Error sending email.`, error);
      throw error;
    }
  }
}
