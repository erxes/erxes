import type { CUSTOMER_CODE_PURPOSES } from '@erxes/core-db/enums';
import { type CustomerLoginKind, customerCodes, type Db, newId } from '@erxes/core-db';
import { and, desc, eq, gt, isNull, sql } from 'drizzle-orm';
import { config } from '~/config';
import { HttpError } from '~/http/errors';
import { normalizeEmail, normalizePhone } from '~/lib/contacts';
import { hmacSha256, randomInt, safeEqual } from '~/lib/crypto';
import { lockKeys } from '~/lib/locks';
import { sendEmail } from '~/modules/email/email';
import { sendSms } from '~/modules/sms/sms';

const CODE_MINUTES = 10;
const MAX_TRIES = 5;
const MAX_PER_HOUR = 5;
const RESEND_SECONDS = 30;

/** An email address or phone, normalised (`addressOf`). */
export interface Address {
  kind: CustomerLoginKind;
  value: string;
}

/** The address as logins and codes keep it: a lower-case email, a phone without formatting. */
export const addressOf = (input: Address): Address => ({
  kind: input.kind,
  value: input.kind === 'email' ? normalizeEmail(input.value) : normalizePhone(input.value),
});

type Purpose = (typeof CUSTOMER_CODE_PURPOSES)[number];

/** Keyed with core's secret: a leaked table doesn't give the codes away by trying all million. */
const hashOf = (id: string, code: string) =>
  hmacSha256(config.auth.jwtSecret, `${id}:${code}`, 'hex');

/** One code at a time per address, across replicas. */
const lockAddress = (tx: Db, orgId: string, address: Address) =>
  lockKeys(tx, [`customer-code:${orgId}:${address.kind}:${address.value}`]);

const forAddress = (address: Address) =>
  and(eq(customerCodes.kind, address.kind), eq(customerCodes.value, address.value));

/**
 * Sends a new code to the address (the earlier ones stop working): 5 an hour,
 * one each 30 seconds. Sent from the transaction's jobs, so a rollback sends
 * nothing.
 */
export const sendCode = async (
  tx: Db,
  organization: { id: string; name: string },
  address: Address,
  purpose: Purpose,
  options: { customerId?: string; ip?: string | null } = {},
) => {
  await lockAddress(tx, organization.id, address);

  const [recent] = await tx
    .select({
      count: sql<number>`count(*)::int`,
      tooSoon: sql<boolean>`coalesce(bool_or(${customerCodes.createdAt} > now() - make_interval(secs => ${RESEND_SECONDS})), false)`,
    })
    .from(customerCodes)
    .where(and(forAddress(address), gt(customerCodes.createdAt, sql`now() - interval '1 hour'`)));

  if (recent && (recent.count >= MAX_PER_HOUR || recent.tooSoon)) {
    throw new HttpError(
      429,
      'TOO_MANY_CODES',
      recent.tooSoon
        ? 'A code was just sent: wait a moment before asking for another'
        : 'Too many codes for this address: try again in an hour',
    );
  }

  await tx
    .update(customerCodes)
    .set({ usedAt: sql`now()` })
    .where(and(forAddress(address), isNull(customerCodes.usedAt)));

  const id = newId();
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');

  await tx.insert(customerCodes).values({
    id,
    kind: address.kind,
    value: address.value,
    purpose,
    customerId: options.customerId ?? null,
    codeHash: hashOf(id, code),
    ip: options.ip ?? null,
    expiresAt: sql`now() + make_interval(mins => ${CODE_MINUTES})`,
  });

  if (address.kind === 'email') {
    await sendEmail(tx, organization.id, {
      to: address.value,
      template: 'sign_in_code',
      data: { organization: organization.name, code, minutes: CODE_MINUTES },
    });
  } else {
    await sendSms(tx, organization.id, {
      to: address.value,
      text: `${code} is your ${organization.name} code. It works for ${CODE_MINUTES} minutes.`,
    });
  }

  return { expiresInSeconds: CODE_MINUTES * 60 };
};

/**
 * Uses the address's latest code: true once for the right code, within 10
 * minutes and 5 tries (a wrong try counts, so commit before failing the
 * request). `add_login` codes only work for the customer who asked.
 */
export const useCode = async (
  tx: Db,
  orgId: string,
  address: Address,
  purpose: Purpose,
  code: string,
  customerId?: string,
) => {
  await lockAddress(tx, orgId, address);

  const [row] = await tx
    .select()
    .from(customerCodes)
    .where(
      and(
        forAddress(address),
        eq(customerCodes.purpose, purpose),
        isNull(customerCodes.usedAt),
        gt(customerCodes.expiresAt, sql`now()`),
      ),
    )
    .orderBy(desc(customerCodes.createdAt))
    .limit(1);

  if (!row || row.attempts >= MAX_TRIES || (row.customerId ?? undefined) !== customerId) {
    return false;
  }

  if (!safeEqual(row.codeHash, hashOf(row.id, code))) {
    await tx
      .update(customerCodes)
      .set({ attempts: sql`${customerCodes.attempts} + 1` })
      .where(eq(customerCodes.id, row.id));

    return false;
  }

  await tx
    .update(customerCodes)
    .set({ usedAt: sql`now()` })
    .where(eq(customerCodes.id, row.id));

  return true;
};

export const invalidCode = () =>
  new HttpError(400, 'INVALID_CODE', 'The code is wrong or has expired: ask for a new one');
