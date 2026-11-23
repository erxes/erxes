import type { CUSTOMER_CODE_PURPOSES } from '@erxes/core-db/enums';
import {
  type CustomerAddressKind,
  type CustomerSignUpData,
  customerCodes,
  type Db,
  newId,
  type portals,
  requestOrgId,
} from '@erxes/core-db';
import { and, desc, eq, gt, isNull, sql } from 'drizzle-orm';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { normalizeEmail, normalizePhone } from '~/lib/contacts';
import { hmacSha256, randomInt, safeEqual } from '~/lib/crypto';
import { lockKeys } from '~/lib/locks';
import { sendEmail } from '~/modules/email/email';
import { canDeliverEmail } from '~/modules/email/sender';
import { canDeliverSms, sendSms } from '~/modules/sms/sms';

const CODE_MINUTES = 10;
const MAX_TRIES = 5;
const MAX_PER_HOUR = 5;
const RESEND_SECONDS = 30;

/** An email address or phone, normalised (`addressOf`). */
export interface Address {
  kind: CustomerAddressKind;
  value: string;
}

/** The address as logins and codes keep it: a lower-case email, a phone without formatting. */
export const addressOf = (input: Address): Address => ({
  kind: input.kind,
  value: input.kind === 'email' ? normalizeEmail(input.value) : normalizePhone(input.value),
});

export type Purpose = (typeof CUSTOMER_CODE_PURPOSES)[number];

/**
 * The portal a code is for: codes work there only, and its settings say how they go
 * (`phoneConnectionId`: verify.mn, the customer texts the code instead of getting it).
 */
export type CodePortal = Pick<
  typeof portals.$inferSelect,
  'id' | 'name' | 'senderName' | 'emailSignIn' | 'phoneSignIn' | 'phoneConnectionId'
>;

/** The customer texts phone codes to the portal's verify.mn connection. */
export const repliesTo = (portal: CodePortal, address: Address) =>
  address.kind === 'phone' ? portal.phoneConnectionId : null;

/** Keyed with core's secret: a leaked table doesn't give the codes away by trying all million. */
const hashOf = (id: string, code: string) =>
  hmacSha256(config.auth.jwtSecret, `${id}:${code}`, 'hex');

/** One code at a time per address and portal, across replicas (advisory locks span organisations). */
const lockAddress = (tx: Db, portalId: string, address: Address) =>
  lockKeys(tx, [`customer-code:${requestOrgId()}:${portalId}:${address.kind}:${address.value}`]);

const forAddress = (portalId: string, address: Address) =>
  and(
    eq(customerCodes.portalId, portalId),
    eq(customerCodes.kind, address.kind),
    eq(customerCodes.value, address.value),
  );

const unavailable = (message: string) => fail('SIGN_IN_UNAVAILABLE', message);

/**
 * 400 SIGN_IN_UNAVAILABLE when the portal doesn't sign in with this kind of address, or a code
 * would only reach the server's log.
 */
const assertDeliverable = async (tx: Db, portal: CodePortal, address: Address) => {
  if (address.kind === 'email') {
    if (!portal.emailSignIn) throw unavailable("This portal doesn't sign in with email");

    if (!(await canDeliverEmail(tx))) {
      throw unavailable("Codes can't be emailed yet: email sending isn't set up");
    }

    return;
  }

  if (!portal.phoneSignIn) throw unavailable("This portal doesn't sign in with a phone");

  if (!repliesTo(portal, address) && !canDeliverSms()) {
    throw unavailable("Codes can't be texted yet: sign in with an email address");
  }
};

/** A new 6-digit code. */
export const newCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0');

/** A code the customer texts: its verify.mn session, started before the code is kept. */
export interface CodeReplySession {
  code: string;
  sessionId: string;
  expiresAt: Date;
}

/**
 * 400 SIGN_IN_UNAVAILABLE or 429 TOO_MANY_CODES unless the portal may have a new code for the
 * address now: 5 an hour, one each 30 seconds.
 */
export const assertCanSend = async (tx: Db, portal: CodePortal, address: Address) => {
  await assertDeliverable(tx, portal, address);
  await lockAddress(tx, portal.id, address);

  const [recent] = await tx
    .select({
      count: sql<number>`count(*)::int`,
      tooSoon: sql<boolean>`coalesce(bool_or(${customerCodes.createdAt} > now() - make_interval(secs => ${RESEND_SECONDS})), false)`,
    })
    .from(customerCodes)
    .where(
      and(
        forAddress(portal.id, address),
        gt(customerCodes.createdAt, sql`now() - interval '1 hour'`),
      ),
    );

  if (recent && (recent.count >= MAX_PER_HOUR || recent.tooSoon)) {
    throw fail(
      'TOO_MANY_CODES',
      recent.tooSoon
        ? 'A code was just sent: wait a moment before asking for another'
        : 'Too many codes for this address: try again in an hour',
    );
  }
};

export const CODE_SECONDS = CODE_MINUTES * 60;

/**
 * Keeps a new code for the portal and the address (the earlier ones stop working) and sends
 * it from the transaction's jobs, so a rollback sends nothing. A code the customer texts
 * (`reply`) was made and started with verify.mn before (`customerCodeReplies`): it is kept
 * with its session and not sent. `deliver: false` answers the same without making one, for an
 * address that may not get one.
 */
export const sendCode = async (
  tx: Db,
  portal: CodePortal,
  address: Address,
  purpose: Purpose,
  options: {
    accountId?: string;
    /** `sign_up`: the checked form, saved once the code is confirmed. */
    signUp?: CustomerSignUpData;
    ip?: string | null;
    deliver?: boolean;
    reply?: CodeReplySession;
  } = {},
) => {
  await assertCanSend(tx, portal, address);

  const { reply } = options;

  // A texted code proves the phone before anything is said about an account: no need to hide.
  if (options.deliver === false && !reply) return;

  await tx
    .update(customerCodes)
    .set({ usedAt: sql`now()` })
    .where(and(forAddress(portal.id, address), isNull(customerCodes.usedAt)));

  const id = newId();
  const code = reply?.code ?? newCode();

  await tx.insert(customerCodes).values({
    id,
    portalId: portal.id,
    kind: address.kind,
    value: address.value,
    purpose,
    accountId: options.accountId ?? null,
    signUp: options.signUp ?? null,
    codeHash: hashOf(id, code),
    replySessionId: reply?.sessionId ?? null,
    ip: options.ip ?? null,
    expiresAt: reply
      ? sql`least(now() + make_interval(mins => ${CODE_MINUTES}), ${reply.expiresAt})`
      : sql`now() + make_interval(mins => ${CODE_MINUTES})`,
  });

  if (reply) return;

  if (address.kind === 'email') {
    await sendEmail(
      tx,
      requestOrgId(),
      {
        to: address.value,
        template: 'sign_in_code',
        fromName: portal.senderName ?? portal.name,
        data: { organization: portal.name, code, minutes: CODE_MINUTES },
      },
      { source: 'customer_account', sourceId: id },
    );
  } else {
    await sendSms(tx, requestOrgId(), {
      to: address.value,
      text: `${code} is your ${portal.name} code. It works for ${CODE_MINUTES} minutes.`,
    });
  }
};

/**
 * Uses the address's latest code for the portal: the code's row once for the right code,
 * within its time and 5 tries, else null (a wrong try counts, so commit before failing the
 * request). `add_login` codes only work for the account that asked. A texted code stays
 * unused while `holdReplies` (its reply is checked first, outside the transaction).
 */
export const useCode = async (
  tx: Db,
  portalId: string,
  address: Address,
  purpose: Purpose,
  code: string,
  options: { accountId?: string; holdReplies?: boolean } = {},
) => {
  await lockAddress(tx, portalId, address);

  const [row] = await tx
    .select()
    .from(customerCodes)
    .where(
      and(
        forAddress(portalId, address),
        eq(customerCodes.purpose, purpose),
        isNull(customerCodes.usedAt),
        gt(customerCodes.expiresAt, sql`now()`),
      ),
    )
    .orderBy(desc(customerCodes.createdAt))
    .limit(1);

  if (!row || row.attempts >= MAX_TRIES || (row.accountId ?? undefined) !== options.accountId) {
    return null;
  }

  if (!safeEqual(row.codeHash, hashOf(row.id, code))) {
    await tx
      .update(customerCodes)
      .set({ attempts: sql`${customerCodes.attempts} + 1` })
      .where(eq(customerCodes.id, row.id));

    return null;
  }

  if (options.holdReplies && row.replySessionId) return row;

  await tx
    .update(customerCodes)
    .set({ usedAt: sql`now()` })
    .where(eq(customerCodes.id, row.id));

  return row;
};

export const invalidCode = () =>
  fail('INVALID_CODE', 'The code is wrong or has expired: ask for a new one');
