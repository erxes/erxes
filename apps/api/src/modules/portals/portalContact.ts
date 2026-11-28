import type { PortalContactInput } from '@erxes/core-contract';
import { runAs, system, withOrg } from '@erxes/core-db';
import { fail } from '~/http/errors';
import { fixedWindow } from '~/http/rateLimit';
import { recordActivity } from '~/modules/activities/record';
import type { LivePortal } from '~/modules/customerAuth/customerPortals';
import { findOrCreateCustomer } from '~/modules/customers/findOrCreateCustomer';
import { sendEmail } from '~/modules/email/email';
import { mailRoute } from '~/modules/email/mailConnections';
import { firstVerifiedReplyTo } from '~/modules/email/replyTos.service';
import { publishCoreEvents } from '~/modules/events/events.service';

// A portal's contact form (decision 42): the visitor's message goes to the organisation by
// email, from the portal's sender as its code emails are, and on the visitor's timeline.

const DEFAULT_SUBJECT = 'Website message';

const unavailable = (message: string) => fail('CONTACT_UNAVAILABLE', message);

let perAddress: ReturnType<typeof fixedWindow> | undefined;

/** 429 TOO_MANY_REQUESTS past 5 messages an hour from one email address on the portal. */
const countMessage = async (portalId: string, email: string) => {
  perAddress ??= fixedWindow({ windowSeconds: 3600, max: 5 });

  const retryAfter = await perAddress(`portal-contact:${portalId}:${email}`);

  if (retryAfter !== null) {
    throw fail(
      'TOO_MANY_REQUESTS',
      `Too many messages from this address: try again in ${retryAfter} seconds`,
    );
  }
};

/** The plain text the organisation reads: who wrote, how to reach them, and what they wrote. */
const bodyOf = (input: PortalContactInput) =>
  [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    ...(input.phone ? [`Phone: ${input.phone}`] : []),
    input.message,
  ].join('\n\n');

/**
 * Emails a visitor's message to the portal's Reply-To, else the organisation's first verified
 * Reply-To address, replying to the visitor. The visitor is found or added in Contacts by email
 * (a customer erxes has stays as staff left them) and the message goes on their timeline.
 * 503 CONTACT_UNAVAILABLE when email would only reach the server's log or no address takes it.
 */
export const sendContactMessage = async (input: PortalContactInput, portal: LivePortal) => {
  await countMessage(portal.id, input.email);

  return withOrg(portal.orgId, (tx) =>
    runAs(system('portal contact form'), async () => {
      const { connectionId, deliverable } = await mailRoute(tx, portal.mailConnectionId);

      if (!deliverable) throw unavailable("Messages can't be emailed yet: email isn't set up");

      const to = portal.replyTo ?? (await firstVerifiedReplyTo(tx));

      if (!to) {
        throw unavailable(
          "Messages can't be emailed yet: the organisation has no verified Reply-To address",
        );
      }

      const { customer } = await findOrCreateCustomer(tx, {
        primaryEmail: input.email,
        firstName: input.name,
        source: 'website',
        sourceDetails: { portalId: portal.id },
      });

      const subject = input.subject ?? DEFAULT_SUBJECT;
      const phone = input.phone ?? null;

      await sendEmail(
        tx,
        portal.orgId,
        {
          to,
          template: 'message',
          fromName: portal.senderName ?? portal.name,
          ...(portal.fromEmail && { fromEmail: portal.fromEmail }),
          replyTo: input.email,
          data: { subject: `${portal.name}: ${subject}`, body: bodyOf(input) },
        },
        { source: 'customer', sourceId: customer.id, connectionId },
      );

      await recordActivity(tx, {
        targetType: 'customer',
        targetId: customer.id,
        type: 'customer.wrote_in',
        data: {
          portalId: portal.id,
          portalName: portal.name,
          subject,
          message: input.message,
          phone,
        },
      });

      await publishCoreEvents(tx, {
        type: 'core.customer.wrote_in',
        subjectType: 'customer',
        subjectId: customer.id,
        payload: { portalId: portal.id, subject, message: input.message, phone },
      });

      return { ok: true as const };
    }),
  );
};
