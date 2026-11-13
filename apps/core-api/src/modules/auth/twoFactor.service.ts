import { type Db, users, withOrg } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { type Actor, userCaller } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { seal, unseal } from '~/lib/secrets';
import { signJwt, verifyJwt } from '~/lib/signing';
import { recordAudit } from '~/modules/audit/audit.service';
import { randomToken, sha256, verifyPassword } from '~/lib/crypto';
import { z } from 'zod';
import { matchStep, newTotpSecret, otpauthUri } from './totp';

const CHALLENGE_TYP = 'erxes-2fa-challenge+jwt';

const ChallengeClaims = z.object({ org: z.string(), sub: z.string() });

const hashCode = (code: string) => sha256(code.replace(/[\s-]/g, '').toLowerCase());

const newRecoveryCodes = () =>
  Array.from({ length: 10 }, () => {
    const raw = randomToken(5, 'hex');

    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });

const findMember = async (client: Db, userId: string) => {
  const [row] = await client.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!row) throw new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue');

  return row;
};

const needPassword = async (client: Db, actor: Actor, password: string) => {
  const member = await findMember(client, actor.userId);

  if (!(await verifyPassword(password, member.passwordHash))) {
    throw new HttpError(400, 'WRONG_PASSWORD', 'The password is not right');
  }

  return member;
};

/** A new secret for the app (not active until confirmed with a code). */
export const setupTwoFactor = async (client: Db, actor: Actor) => {
  const member = await findMember(client, actor.userId);

  if (member.totpEnabledAt)
    throw new HttpError(409, 'ALREADY_ENABLED', 'Two-factor sign-in is already on');

  const secret = newTotpSecret();

  await client
    .update(users)
    .set({ totpPendingSealed: seal(secret), updatedAt: sql`now()` })
    .where(eq(users.id, actor.userId));

  return { secret, uri: otpauthUri(secret, member.email) };
};

export const enableTwoFactor = async (client: Db, actor: Actor, code: string) => {
  const member = await findMember(client, actor.userId);

  if (!member.totpPendingSealed) throw new HttpError(409, 'NOT_SET_UP', 'Start the setup first');

  const secret = unseal(member.totpPendingSealed);
  const step = matchStep(secret, code);

  if (step === null)
    throw new HttpError(
      400,
      'WRONG_CODE',
      "That code doesn't match: check the app and the phone's clock",
    );

  const recoveryCodes = newRecoveryCodes();

  await client
    .update(users)
    .set({
      totpSecretSealed: member.totpPendingSealed,
      totpPendingSealed: null,
      totpEnabledAt: sql`now()`,
      totpLastStep: step,
      recoveryCodes: recoveryCodes.map(hashCode),
      // Other sessions sign in again, with the second step.
      sessionVersion: sql`${users.sessionVersion} + 1`,
      updatedAt: sql`now()`,
    })
    .where(eq(users.id, actor.userId));
  await recordAudit(client, userCaller(actor), {
    action: 'auth.two_factor_enabled',
    targetType: 'user',
    targetId: actor.userId,
    targetLabel: member.email,
  });

  return { recoveryCodes };
};

export const disableTwoFactor = async (client: Db, actor: Actor, password: string) => {
  const member = await needPassword(client, actor, password);

  await client
    .update(users)
    .set({
      totpSecretSealed: null,
      totpPendingSealed: null,
      totpEnabledAt: null,
      totpLastStep: null,
      recoveryCodes: null,
      updatedAt: sql`now()`,
    })
    .where(eq(users.id, actor.userId));
  await recordAudit(client, userCaller(actor), {
    action: 'auth.two_factor_disabled',
    targetType: 'user',
    targetId: actor.userId,
    targetLabel: member.email,
  });

  return { ok: true as const };
};

export const regenerateRecoveryCodes = async (client: Db, actor: Actor, password: string) => {
  const member = await needPassword(client, actor, password);

  if (!member.totpEnabledAt) throw new HttpError(409, 'NOT_ENABLED', 'Two-factor sign-in is off');

  const recoveryCodes = newRecoveryCodes();

  await client
    .update(users)
    .set({ recoveryCodes: recoveryCodes.map(hashCode), updatedAt: sql`now()` })
    .where(eq(users.id, actor.userId));
  await recordAudit(client, userCaller(actor), {
    action: 'auth.recovery_codes_renewed',
    targetType: 'user',
    targetId: actor.userId,
  });

  return { recoveryCodes };
};

/** After a correct password: a 5-minute challenge for the second step instead of a session. */
export const twoFactorChallenge = (orgId: string, userId: string) =>
  signJwt(
    { org: orgId },
    { typ: CHALLENGE_TYP, audience: 'erxes-core', subject: userId, expiresInSeconds: 300 },
  );

/**
 * The second step: an authenticator code (each works once) or a recovery
 * code (each works once). Failures count toward the sign-in lockout.
 */
export const completeTwoFactor = async (input: {
  challenge: string;
  code?: string;
  recoveryCode?: string;
}) => {
  const challenge = await verifyJwt(input.challenge, ChallengeClaims, {
    typ: CHALLENGE_TYP,
    audience: 'erxes-core',
  }).catch(() => null);

  if (!challenge) {
    throw new HttpError(401, 'CHALLENGE_EXPIRED', 'Sign in again: the second step took too long');
  }

  const { org: orgId, sub: userId } = challenge;

  return withOrg(orgId, async (tx) => {
    // One second step at a time per member: a code can't be used twice in a race.
    const [member] = await tx
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .for('update')
      .limit(1);

    if (!member || member.status !== 'active' || !member.totpSecretSealed)
      throw new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue');

    if (input.code) {
      const step = matchStep(unseal(member.totpSecretSealed), input.code);

      if (step === null || (member.totpLastStep !== null && step <= member.totpLastStep)) {
        await recordAudit(
          tx,
          { orgId, actorType: 'user', actorId: userId, source: 'core' },
          {
            action: 'auth.sign_in_failed',
            targetType: 'user',
            targetId: userId,
            targetLabel: member.email,
            metadata: { reason: 'wrong two-factor code' },
          },
        );
        throw new HttpError(401, 'WRONG_CODE', "That code doesn't match");
      }

      await tx.update(users).set({ totpLastStep: step }).where(eq(users.id, userId));
    } else {
      const hashed = hashCode(input.recoveryCode ?? '');

      if (!member.recoveryCodes?.includes(hashed))
        throw new HttpError(401, 'WRONG_CODE', "That recovery code doesn't match");

      await tx
        .update(users)
        .set({ recoveryCodes: member.recoveryCodes.filter((code) => code !== hashed) })
        .where(eq(users.id, userId));
      await recordAudit(
        tx,
        { orgId, actorType: 'user', actorId: userId, source: 'core' },
        {
          action: 'auth.recovery_code_used',
          targetType: 'user',
          targetId: userId,
          metadata: { left: member.recoveryCodes.length - 1 },
        },
      );
    }

    return { orgId, userId };
  });
};
