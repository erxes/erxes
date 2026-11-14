import { requestOrgId } from '@erxes/core-db';
import { audited, scoped } from '~/orpc';
import { sendEmail } from './email';

export const emailsRouter = {
  // Queued in the request's transaction with its audit entry; the email job sends them.
  send: scoped.emails.send.handler(({ input: { to, replyTo, ...data } }) =>
    audited(
      async (tx) => {
        const addresses = [...new Set(to.map((address) => address.toLowerCase()))];

        await sendEmail(
          tx,
          requestOrgId(),
          addresses.map((address) => ({ to: address, template: 'message', replyTo, data })),
        );

        return { queued: addresses.length, addresses };
      },
      (result) => ({
        action: 'email.sent',
        targetType: 'email',
        targetLabel: data.subject,
        metadata: { to: result.addresses, replyTo: replyTo ?? null },
      }),
    ).then(({ queued }) => ({ queued })),
  ),
};
