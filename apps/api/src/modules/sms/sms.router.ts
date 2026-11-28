import { caller, requestOrgId } from '@erxes/core-db';
import { fail } from '~/http/errors';
import { normalizePhone } from '~/lib/contacts';
import { audited, scoped } from '~/orpc';
import { canDeliverSms, sendSms } from './sms';

export const smsRouter = {
  // Queued in the request's transaction with its audit entry; the `sms.send` job sends each.
  send: scoped.sms.send.handler(({ input: { to, text } }) =>
    audited(
      async (tx) => {
        if (!(await canDeliverSms(tx))) {
          throw fail(
            'SMS_NOT_CONFIGURED',
            'Texts can’t go out: connect CallPro or Twilio in Settings › Integrations',
          );
        }

        const phones = [...new Set(to.map(normalizePhone))];

        await sendSms(
          tx,
          requestOrgId(),
          phones.map((phone) => ({ to: phone, text })),
        );

        return { queued: phones.length, phones };
      },
      (result) => ({
        action: 'sms.sent',
        targetType: 'sms',
        targetLabel: caller('plugin').plugin,
        metadata: { to: result.phones },
      }),
    ).then(({ queued }) => ({ queued })),
  ),
};
