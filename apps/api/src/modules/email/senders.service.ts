import { caller, type Db, emailSenders, newId, requestOrgId } from '@erxes/core-db';
import { asc, eq, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { hmacSha256, safeEqual } from '~/lib/crypto';
import { wholeList } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { coreKey } from '~/lib/secrets';
import { recordAudit } from '~/modules/audit/audit.service';
import { organizationName } from '~/modules/broadcasts/broadcasts.service';
import { appLink, sendEmail } from './email';

type SenderRow = typeof emailSenders.$inferSelect;

/**
 * The confirmation link signs the sender's id and address, so it confirms
 * only the address it was sent to, and stops working once the sender is removed.
 */
const signatureOf = (sender: Pick<SenderRow, 'id' | 'email'>) =>
  hmacSha256(coreKey('erxes-email-sender-links-v1'), `${sender.id}:${sender.email}`, 'base64url');

export const isSenderSignature = (sender: Pick<SenderRow, 'id' | 'email'>, signature: string) =>
  safeEqual(signature, signatureOf(sender));

/** The confirmation page, under `APP_URL` (the API answers `/core/v1` on the same origin). */
const confirmPath = (sender: Pick<SenderRow, 'id' | 'email'>) =>
  `/core/v1/email/senders/${sender.id}/${signatureOf(sender)}/confirm`;

export const listSenders = async (client: Db) => ({
  data: await wholeList((limit) =>
    client.select().from(emailSenders).orderBy(asc(emailSenders.email)).limit(limit),
  ),
});

/** Queues the confirmation email to the sender's address, in the caller's transaction. */
const sendConfirmation = async (client: Db, sender: SenderRow) =>
  sendEmail(client, requestOrgId(), {
    to: sender.email,
    template: 'sender_confirmation',
    data: {
      organization: await organizationName(client),
      link: await appLink(client, confirmPath(sender)),
    },
  });

/** 409 TAKEN when the address is a sender already. */
export const addSender = async (client: Db, input: { email: string; name: string }) => {
  const sender = oneRow(
    await client
      .insert(emailSenders)
      .values({ id: newId(), ...input, createdBy: caller('user').userId })
      .returning(),
  );

  await sendConfirmation(client, sender);
  await recordAudit(client, {
    action: 'email.sender_added',
    targetType: 'email_sender',
    targetId: sender.id,
    targetLabel: sender.email,
  });

  return sender;
};

const senderRow = async (client: Db, id: string) => {
  const [sender] = await client.select().from(emailSenders).where(eq(emailSenders.id, id)).limit(1);

  if (!sender) throw notFound('Sender');

  return sender;
};

export const resendConfirmation = async (client: Db, id: string) => {
  const sender = await senderRow(client, id);

  if (sender.confirmedAt) throw fail('NOT_PENDING', 'The address is confirmed already');

  await sendConfirmation(client, sender);

  return { ok: true as const };
};

export const removeSender = async (client: Db, id: string) => {
  const [sender] = await client.delete(emailSenders).where(eq(emailSenders.id, id)).returning();

  if (!sender) throw notFound('Sender');

  await recordAudit(client, {
    action: 'email.sender_removed',
    targetType: 'email_sender',
    targetId: sender.id,
    targetLabel: sender.email,
  });

  return { ok: true as const };
};

/** The link was opened: the address is confirmed (once; opening it again changes nothing). */
export const confirmSender = async (client: Db, sender: SenderRow) => {
  if (sender.confirmedAt) return;

  await client
    .update(emailSenders)
    .set({ confirmedAt: sql`now()`, updatedAt: sql`now()` })
    .where(eq(emailSenders.id, sender.id));
  await recordAudit(client, {
    action: 'email.sender_confirmed',
    targetType: 'email_sender',
    targetId: sender.id,
    targetLabel: sender.email,
  });
};
