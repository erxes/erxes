import {
  callerUserId,
  type Db,
  emailReplyTos,
  newId,
  organizations,
  runAs,
  system,
  users,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, asc, eq, gt, sql } from 'drizzle-orm';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { randomToken, safeEqual, sha256 } from '~/lib/crypto';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { invalidLink } from '~/modules/auth/tokens.service';
import { appLink, sendEmail } from './email';

const CONFIRM_DAYS = 7;

const sameEmail = (email: string) => sql`lower(${emailReplyTos.email}) = ${email.toLowerCase()}`;

export const listReplyTos = (client: Db) =>
  client.select().from(emailReplyTos).orderBy(asc(emailReplyTos.email));

/** An active team member's address is the organisation's already: it needs no link (erxes support's does). */
const isMemberEmail = async (client: Db, email: string) => {
  const [member] = await client
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        sql`lower(${users.email}) = ${email}`,
        eq(users.status, 'active'),
        eq(users.isSupport, false),
      ),
    )
    .limit(1);

  return !!member;
};

/**
 * Why an address needs no link: self-hosted the installation answers for its
 * own sending; on SaaS a member's own address is the organisation's already.
 * Only another address on SaaS's shared provider is confirmed by a link.
 */
const verifiedBy = async (client: Db, email: string) => {
  if (!config.saas.enabled) return 'self-hosted';

  return (await isMemberEmail(client, email)) ? 'member' : null;
};

/**
 * Adds a Reply-To address, verified at once unless SaaS needs its link
 * (`verifiedBy`); asked again, a new link. A verified one stays.
 */
export const addReplyTo = async (client: Db, email: string) => {
  const [existing] = await client.select().from(emailReplyTos).where(sameEmail(email)).limit(1);

  if (existing?.status === 'verified') return existing;

  const save = async (values: Omit<typeof emailReplyTos.$inferInsert, 'id' | 'email'>) =>
    oneRow(
      existing
        ? await client
            .update(emailReplyTos)
            .set(values)
            .where(eq(emailReplyTos.id, existing.id))
            .returning()
        : await client
            .insert(emailReplyTos)
            .values({ id: newId(), email, createdBy: callerUserId(), ...values })
            .returning(),
    );

  const by = await verifiedBy(client, email);

  if (by) {
    const row = await save({
      status: 'verified',
      secretHash: null,
      expiresAt: null,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    });

    await recordAudit(client, {
      action: 'email.reply_to_verified',
      targetType: 'email_reply_to',
      targetId: row.id,
      targetLabel: email,
      metadata: { by },
    });

    return row;
  }

  const secret = randomToken(32);

  const row = await save({
    status: 'pending',
    secretHash: sha256(secret),
    expiresAt: new Date(Date.now() + CONFIRM_DAYS * 24 * 60 * 60_000),
    updatedAt: new Date(),
  });

  const [org] = await client.select({ name: organizations.name }).from(organizations).limit(1);
  const app = await appLink(client, '');

  await sendEmail(
    client,
    row.orgId,
    {
      to: email,
      template: 'reply_to_confirmation',
      data: {
        organization: org?.name ?? 'erxes',
        link: `${app}/confirm-reply-to?token=${encodeURIComponent(`${row.id}.${secret}`)}`,
        days: CONFIRM_DAYS,
      },
    },
    { source: 'settings', sourceId: row.id },
  );
  await recordAudit(client, {
    action: 'email.reply_to_added',
    targetType: 'email_reply_to',
    targetId: row.id,
    targetLabel: email,
  });

  return row;
};

export const removeReplyTo = async (client: Db, id: string) => {
  const [row] = await client.delete(emailReplyTos).where(eq(emailReplyTos.id, id)).returning();

  if (!row) throw fail('NOT_FOUND', 'No such Reply-To address');

  await recordAudit(client, {
    action: 'email.reply_to_removed',
    targetType: 'email_reply_to',
    targetId: row.id,
    targetLabel: row.email,
  });

  return { ok: true as const };
};

/**
 * Confirms an address from its link. The id says where to look (the one
 * lookup before the organisation is known); the secret must match its hash.
 */
export const confirmReplyTo = async (token: string) => {
  const [id, secret] = token.split('.');

  if (!id || !secret) throw invalidLink();

  const [found] = await withSystem('reply-to link lookup', (tx) =>
    tx
      .select({ orgId: emailReplyTos.orgId, secretHash: emailReplyTos.secretHash })
      .from(emailReplyTos)
      .where(
        and(
          eq(emailReplyTos.id, id),
          eq(emailReplyTos.status, 'pending'),
          gt(emailReplyTos.expiresAt, sql`now()`),
        ),
      )
      .limit(1),
  );

  if (!found?.secretHash || !safeEqual(found.secretHash, sha256(secret))) throw invalidLink();

  return withOrg(found.orgId, async (tx) => {
    const [row] = await tx
      .update(emailReplyTos)
      .set({
        status: 'verified',
        secretHash: null,
        expiresAt: null,
        verifiedAt: sql`now()`,
        updatedAt: sql`now()`,
      })
      .where(and(eq(emailReplyTos.id, id), eq(emailReplyTos.status, 'pending')))
      .returning();

    if (!row) throw invalidLink();

    const [org] = await tx.select({ name: organizations.name }).from(organizations).limit(1);

    // Whoever opened the link isn't signed in: the link itself is the proof.
    await runAs(system('reply-to confirmed by its link'), () =>
      recordAudit(tx, {
        action: 'email.reply_to_verified',
        targetType: 'email_reply_to',
        targetId: row.id,
        targetLabel: row.email,
        metadata: { by: 'link' },
      }),
    );

    return { email: row.email, organization: org?.name ?? '' };
  });
};

export const isVerifiedReplyTo = async (client: Db, email: string) => {
  const [row] = await client
    .select({ id: emailReplyTos.id })
    .from(emailReplyTos)
    .where(and(sameEmail(email), eq(emailReplyTos.status, 'verified')))
    .limit(1);

  return !!row;
};

/** The organisation's first verified Reply-To address, or null while it has none. */
export const firstVerifiedReplyTo = async (client: Db) => {
  const [row] = await client
    .select({ email: emailReplyTos.email })
    .from(emailReplyTos)
    .where(eq(emailReplyTos.status, 'verified'))
    .orderBy(asc(emailReplyTos.verifiedAt), asc(emailReplyTos.id))
    .limit(1);

  return row?.email ?? null;
};

/**
 * A Reply-To the organisation may use: one of its verified addresses. Anything
 * else is a 400 on `path`, so no email asks replies to go to another's inbox.
 */
export const requireReplyTo = async (
  client: Db,
  email: string | null | undefined,
  path: (string | number)[] = ['replyTo'],
) => {
  if (!email || (await isVerifiedReplyTo(client, email))) return;

  const message = `${email} isn't a verified Reply-To address: add it in Settings › Organization email`;

  throw fail('INVALID_INPUT', message, { issues: [{ path, message }] });
};
