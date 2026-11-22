import type { CUSTOMER_CODE_PURPOSES } from '@erxes/core-db/enums';
import {
  type CustomerLoginKind,
  type CustomerSignUpData,
  customerCodes,
  type Db,
  newId,
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
  kind: CustomerLoginKind;
  value: string;
}

/** The address as logins and codes keep it: a lower-case email, a phone without formatting. */
export const addressOf = (input: Address): Address => ({
  kind: input.kind,
  value: input.kind === 'email' ? normalizeEmail(input.value) : normalizePhone(input.value),
});

type Purpose = (typeof CUSTOMER_CODE_PURPOSES)[number];

/** The website a code is for: codes work there only, and the message names it. */
export interface CodeWebsite {
  id: string;
  name: string;
}

/** Keyed with core's secret: a leaked table doesn't give the codes away by trying all million. */
const hashOf = (id: string, code: string) =>
  hmacSha256(config.auth.jwtSecret, `${id}:${code}`, 'hex');

/** One code at a time per address and website, across replicas (advisory locks span organisations). */
const lockAddress = (tx: Db, websiteId: string, address: Address) =>
  lockKeys(tx, [`customer-code:${requestOrgId()}:${websiteId}:${address.kind}:${address.value}`]);

const forAddress = (websiteId: string, address: Address) =>
  and(
    eq(customerCodes.websiteId, websiteId),
    eq(customerCodes.kind, address.kind),
    eq(customerCodes.value, address.value),
  );

/** 400 SIGN_IN_UNAVAILABLE when a code would only reach the server's log. */
const assertDeliverable = async (tx: Db, address: Address) => {
  const delivers = address.kind === 'email' ? await canDeliverEmail(tx) : canDeliverSms();

  if (!delivers) {
    throw fail(
      'SIGN_IN_UNAVAILABLE',
      address.kind === 'email'
        ? "Codes can't be emailed yet: email sending isn't set up"
        : "Codes can't be texted yet: sign in with an email address",
    );
  }
};

/**
 * Sends a new code for the website to the address (the earlier ones stop
 * working): 5 an hour, one each 30 seconds. Sent from the transaction's jobs,
 * so a rollback sends nothing. `deliver: false` answers the same without
 * sending, for an address that may not get one.
 */
export const sendCode = async (
  tx: Db,
  website: CodeWebsite,
  address: Address,
  purpose: Purpose,
  options: {
    accountId?: string;
    /** `sign_up`: the checked form, saved once the code is confirmed. */
    signUp?: CustomerSignUpData;
    ip?: string | null;
    deliver?: boolean;
  } = {},
) => {
  await assertDeliverable(tx, address);
  await lockAddress(tx, website.id, address);

  const [recent] = await tx
    .select({
      count: sql<number>`count(*)::int`,
      tooSoon: sql<boolean>`coalesce(bool_or(${customerCodes.createdAt} > now() - make_interval(secs => ${RESEND_SECONDS})), false)`,
    })
    .from(customerCodes)
    .where(
      and(
        forAddress(website.id, address),
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

  const answer = { expiresInSeconds: CODE_MINUTES * 60 };

  if (options.deliver === false) return answer;

  await tx
    .update(customerCodes)
    .set({ usedAt: sql`now()` })
    .where(and(forAddress(website.id, address), isNull(customerCodes.usedAt)));

  const id = newId();
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');

  await tx.insert(customerCodes).values({
    id,
    websiteId: website.id,
    kind: address.kind,
    value: address.value,
    purpose,
    accountId: options.accountId ?? null,
    signUp: options.signUp ?? null,
    codeHash: hashOf(id, code),
    ip: options.ip ?? null,
    expiresAt: sql`now() + make_interval(mins => ${CODE_MINUTES})`,
  });

  if (address.kind === 'email') {
    await sendEmail(
      tx,
      requestOrgId(),
      {
        to: address.value,
        template: 'sign_in_code',
        data: { organization: website.name, code, minutes: CODE_MINUTES },
      },
      { source: 'customer_account', sourceId: id },
    );
  } else {
    await sendSms(tx, requestOrgId(), {
      to: address.value,
      text: `${code} is your ${website.name} code. It works for ${CODE_MINUTES} minutes.`,
    });
  }

  return answer;
};

/**
 * Uses the address's latest code for the website: the code's row once for the
 * right code, within 10 minutes and 5 tries, else null (a wrong try counts, so
 * commit before failing the request). `add_login` codes only work for the account that asked.
 */
export const useCode = async (
  tx: Db,
  websiteId: string,
  address: Address,
  purpose: Purpose,
  code: string,
  accountId?: string,
) => {
  await lockAddress(tx, websiteId, address);

  const [row] = await tx
    .select()
    .from(customerCodes)
    .where(
      and(
        forAddress(websiteId, address),
        eq(customerCodes.purpose, purpose),
        isNull(customerCodes.usedAt),
        gt(customerCodes.expiresAt, sql`now()`),
      ),
    )
    .orderBy(desc(customerCodes.createdAt))
    .limit(1);

  if (!row || row.attempts >= MAX_TRIES || (row.accountId ?? undefined) !== accountId) {
    return null;
  }

  if (!safeEqual(row.codeHash, hashOf(row.id, code))) {
    await tx
      .update(customerCodes)
      .set({ attempts: sql`${customerCodes.attempts} + 1` })
      .where(eq(customerCodes.id, row.id));

    return null;
  }

  await tx
    .update(customerCodes)
    .set({ usedAt: sql`now()` })
    .where(eq(customerCodes.id, row.id));

  return row;
};

export const invalidCode = () =>
  fail('INVALID_CODE', 'The code is wrong or has expired: ask for a new one');
