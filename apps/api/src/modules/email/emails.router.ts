import { db, requestOrgId } from '@erxes/core-db';
import { audited, scoped, unscoped } from '~/orpc';
import { listAddresses } from './addresses';
import { listDeliveries } from './deliveries';
import { checkDomains } from './domains';
import { getLimits, getPacing, resumeSending, setRamp } from './limits.service';
import { listMailConnections } from './mailConnections';
import { sendPluginEmail } from './pluginEmails';
import { addReplyTo, confirmReplyTo, listReplyTos, removeReplyTo } from './replyTos.service';
import { getSender } from './sender';
import { getSettings, removeSettings, saveSettings, sendTest } from './settings.service';

export const emailsRouter = {
  // Queued in the request's transaction with its audit entry; the email job sends them.
  send: scoped.emails.send.handler(({ input }) =>
    audited(
      (tx) => sendPluginEmail(tx, input),
      ({ addresses, ...route }) => ({
        action: 'email.sent',
        targetType: 'email',
        targetLabel: input.subject,
        metadata: { to: addresses, ...route },
      }),
    ).then(({ addresses }) => ({ queued: addresses.length })),
  ),
  mailConnections: scoped.emails.mailConnections.handler(() => listMailConnections(db())),
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
