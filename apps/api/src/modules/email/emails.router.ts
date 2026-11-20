import { db, requestOrgId } from '@erxes/core-db';
import { config } from '~/config';
import { audited, scoped, unscoped } from '~/orpc';
import { sendEmail } from './email';
import { addSender, listSenders, removeSender, resendConfirmation } from './senders.service';
import { getSettings, removeSettings, saveSettings, sendTest } from './settings.service';

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
  settings: scoped.emails.settings.handler(() => getSettings(db())),
  // Signs in to the mail server first: no transaction held meanwhile.
  saveSettings: unscoped.emails.saveSettings.handler(({ input }) => saveSettings(input)),
  defaultSending: unscoped.emails.defaultSending.handler(() => ({
    from: config.email.driver === 'log' ? null : config.email.from,
  })),
  removeSettings: scoped.emails.removeSettings.handler(() => removeSettings(db())),
  // Sends over the network: no transaction held meanwhile.
  sendTest: unscoped.emails.sendTest.handler(({ input }) => sendTest(input.to)),
  senders: scoped.emails.senders.handler(() => listSenders(db())),
  addSender: scoped.emails.addSender.handler(({ input }) => addSender(db(), input)),
  resendConfirmation: scoped.emails.resendConfirmation.handler(({ input }) =>
    resendConfirmation(db(), input.id),
  ),
  removeSender: scoped.emails.removeSender.handler(({ input }) => removeSender(db(), input.id)),
};
