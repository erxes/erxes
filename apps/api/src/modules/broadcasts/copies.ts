import { EmailAddress, PhoneNumber } from '@erxes/core-contract';
import { type Db, requestOrgId } from '@erxes/core-db';
import { z } from 'zod';
import { callerCan } from '~/http/access';
import { fail, notFound } from '~/http/errors';
import { normalizePhone } from '~/lib/contacts';
import { sendEmail } from '~/modules/email/email';
import { requireReplyTo } from '~/modules/email/replyTos.service';
import { sendSms } from '~/modules/sms/sms';
import { firstOfAudience } from './audience';
import { assertDeliverable, getBroadcast, organizationName, valuesOf } from './broadcasts.service';
import { SAMPLE_VALUES } from './placeholders';
import { renderCopy } from './render';

/** A real customer's values show in a preview only to members who may see customers. */
const maySeeCustomers = () => callerCan('contacts.view');

/**
 * The broadcast as one customer would get it: the named customer, else the
 * audience's first, else sample values. Links aren't tracked in a preview.
 */
export const previewBroadcast = async (client: Db, id: string, customerId?: string) => {
  const broadcast = await getBroadcast(client, id);
  const organization = await organizationName(client);

  const pick = maySeeCustomers()
    ? (customerId ?? (await firstOfAudience(client, broadcast.channel, broadcast)))
    : null;

  const values = pick ? (await valuesOf(client, [pick], organization)).get(pick) : null;

  if (customerId && !values) throw notFound('Customer');

  const copy = renderCopy(broadcast, values ?? { ...SAMPLE_VALUES, organization }, null);
  const to = values ? (broadcast.channel === 'email' ? values.email : values.phone) : null;

  return { to, subject: copy.subject, html: copy.html, text: copy.text };
};

/** Each address must fit the channel. */
const addressesFor = (channel: 'email' | 'sms', to: string[]) => {
  const parsed = z.array(channel === 'email' ? EmailAddress : PhoneNumber).safeParse(to);

  if (!parsed.success) {
    throw fail(
      'INVALID_INPUT',
      `Test ${channel === 'email' ? 'emails' : 'texts'} go to ${channel === 'email' ? 'email addresses' : 'phone numbers'}`,
      {
        issues: [
          {
            path: ['to'],
            message: `not ${channel === 'email' ? 'an email address' : 'a phone number'}`,
          },
        ],
      },
    );
  }

  return [...new Set(channel === 'email' ? parsed.data : parsed.data.map(normalizePhone))];
};

/**
 * Sends the broadcast with sample values to a few addresses, queued in the
 * request's transaction. Not counted and not tracked; the subject says Test.
 */
export const testBroadcast = async (client: Db, id: string, to: string[]) => {
  const broadcast = await getBroadcast(client, id);
  const addresses = addressesFor(broadcast.channel, to);
  const organization = await organizationName(client);
  const copy = renderCopy(broadcast, { ...SAMPLE_VALUES, organization }, null);

  if (broadcast.channel === 'sms') {
    await assertDeliverable(client, broadcast);
    await sendSms(
      client,
      requestOrgId(),
      addresses.map((address) => ({ to: address, text: `[Test] ${copy.text}` })),
    );
  } else {
    await assertDeliverable(client, broadcast);
    await requireReplyTo(client, broadcast.replyTo);
    await sendEmail(
      client,
      requestOrgId(),
      addresses.map((address) => ({
        to: address,
        template: 'rendered' as const,
        replyTo: broadcast.replyTo ?? undefined,
        fromName: broadcast.fromName ?? undefined,
        data: { subject: `[Test] ${copy.subject ?? ''}`, html: copy.html ?? '', text: copy.text },
        fileIds: broadcast.attachmentIds,
      })),
      { source: 'broadcast', sourceId: broadcast.id },
    );
  }

  return { queued: addresses.length };
};
