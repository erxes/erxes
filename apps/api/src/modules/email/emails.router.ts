import { caller, db, requestOrgId } from '@erxes/core-db';
import { audited, scoped, unscoped } from '~/orpc';
import { listAddresses } from './addresses';
import { listDeliveries } from './deliveries';
import { checkDomains } from './domains';
import { sendEmail } from './email';
import { getLimits, getPacing, resumeSending, setRamp } from './limits.service';
import {
  addReplyTo,
  confirmReplyTo,
  listReplyTos,
  removeReplyTo,
  requireReplyTo,
} from './replyTos.service';
import { getSender, requireDelivery } from './sender';
import { getSettings, removeSettings, saveSettings, sendTest } from './settings.service';

export const emailsRouter = {
  // Queued in the request's transaction with its audit entry; the email job sends them.
  send: scoped.emails.send.handler(({ input: { to, replyTo, ...data } }) =>
    audited(
      async (tx) => {
        await requireDelivery(tx);
        await requireReplyTo(tx, replyTo);

        const addresses = [...new Set(to.map((address) => address.toLowerCase()))];

        await sendEmail(
          tx,
          requestOrgId(),
          addresses.map((address) => ({ to: address, template: 'message', replyTo, data })),
          { source: 'plugin', sourceId: caller('plugin').plugin },
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
  saveSettings: scoped.emails.saveSettings.handler(({ input }) => saveSettings(db(), input)),
  removeSettings: scoped.emails.removeSettings.handler(() => removeSettings(db())),
  // Sends over the network: no transaction held meanwhile.
  sendTest: unscoped.emails.sendTest.handler(({ input }) => sendTest(input.to)),
  // Asks the provider over the network, so no transaction either.
  checkDomains: unscoped.emails.checkDomains.handler(() => checkDomains(requestOrgId())),
  sender: scoped.emails.sender.handler(() => getSender(db())),
  deliveries: scoped.emails.deliveries.handler(({ input }) => listDeliveries(db(), input)),
  addresses: scoped.emails.addresses.handler(({ input }) => listAddresses(db(), input)),
  limits: scoped.emails.limits.handler(() => getLimits(db())),
  pacing: scoped.emails.pacing.handler(() => getPacing(db())),
  resumeSending: scoped.emails.resumeSending.handler(({ input }) =>
    resumeSending(db(), input.reason),
  ),
  setRamp: scoped.emails.setRamp.handler(({ input }) => setRamp(db(), input.enabled)),
  replyTos: scoped.emails.replyTos.handler(() => listReplyTos(db())),
  addReplyTo: scoped.emails.addReplyTo.handler(({ input }) => addReplyTo(db(), input.email)),
  removeReplyTo: scoped.emails.removeReplyTo.handler(({ input }) => removeReplyTo(db(), input.id)),
  // Opened from the link in the email, signed in or not: the organisation comes from the link.
  confirmReplyTo: unscoped.emails.confirmReplyTo.handler(({ input }) =>
    confirmReplyTo(input.token),
  ),
};
