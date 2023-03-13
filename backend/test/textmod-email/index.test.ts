import tape from "tape";

import { EmailAddress, EmailClient, EmailMessage, EmailRecipients, PlainTextEmailContent } from '@azure/communication-email';
import { EmailSendConnectionManager } from '../../src/textmod-email/index';

// Create an instance of the email send connection manager
const emailManager = new EmailSendConnectionManager('endpoint=https://textmod-communicationservice.communication.azure.com/;accesskey=MiFU3rnnqjEX9f7wTV7R8bdfnBi1+tQBpa3D51vv/Ns+I1yohXo9fIJx+CZQSBwMP6yx6Q/GkNO1lHVyY5wweg==');

// Define the email message
const email: EmailMessage = {
  senderAddress: 'no-reply@textmod.xyz',
  replyTo: [{ address: 'no-reply@textmod.xyz' } as EmailAddress],
  content: {
    subject: "Test subject",
    plainText: "Test plainText message",
    html: '<html><body>Hello html text</body></html>'
  } as PlainTextEmailContent,
  recipients: { to: [{ address: 'boris@c4rex.dev' } as EmailAddress]} as EmailRecipients
};

// Send the email
emailManager.sendEmail(email)
  .catch(error => console.error('Error sending email:', error));
