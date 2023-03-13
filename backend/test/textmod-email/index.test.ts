import test from 'tape';
import { EmailAddress, EmailClient, EmailMessage, EmailRecipients, PlainTextEmailContent } from '@azure/communication-email';
import { EmailSendConnectionManager } from '../../src/textmod-email/index';

test('Test sending email', async (t) => {
  // Create an instance of the email send connection manager
  const emailManager = new EmailSendConnectionManager(process.env.AZ_COM_EMAIL_SERVICE_CONNECTION_STRING as string);

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
  try {
    await emailManager.sendEmail(email);
    t.pass('Email sent successfully');
    process.exitCode = 0; // Set exit code to 0 on success
  } catch (error) {
    t.fail(`Error sending email: ${error}`);
    process.exitCode = 1; // Set exit code to 1 on failure
  }

  t.end();
});
