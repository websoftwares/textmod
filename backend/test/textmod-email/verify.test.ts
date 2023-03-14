import test from 'tape';
import VerifiedEmails, { VerifyEmail } from "../../src/textmod-email/verify"

test('VerifiedEmails', async (t) => {
  let verifiedEmails: VerifiedEmails;
  verifiedEmails = new VerifiedEmails()

  t.test('create', async (t) => {
    t.plan(3);

    const email  = {
        user_id: 58,
        verified_at: null,
        id: null,
    } as unknown as VerifyEmail

    console.log(email)

    const result = await verifiedEmails.create(email);

    t.ok(result.id, 'should have an id');
    t.equal(result.user_id, email.user_id, 'should have the same user_id');
    t.equal(result.verified_at, null, 'should have null verified_at');
  });
});
