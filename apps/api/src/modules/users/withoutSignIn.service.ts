import { apiKeys, caller, callerUserId, db, type Db, newId, users } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { lockOrganization } from '~/lib/locks';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { sendInvitations } from '~/modules/auth/tokens.service';
import { assertAssignable } from '~/modules/roles/roles.service';
import { profileChanges, type UserChanges } from './userProfile';
import { findUser, type UserRow } from './userRows';

const labelOf = (row: UserRow) => row.email ?? row.fullName ?? row.id;

/** Someone on the team who doesn't sign in: no invitation, no password, no seat. */
export const addMember = async (
  client: Db,
  input: Omit<UserChanges, 'username' | 'avatarUrl' | 'links'> & { fullName: string },
) => {
  const role = input.role ?? 'member';

  // A plugin gives the default role only; a member gives what their own role allows.
  if (caller().type === 'plugin') {
    if (role !== 'member') throw fail('NOT_ALLOWED', 'Plugins add members with the member role');
  } else {
    await assertAssignable(client, role);
  }

  const row = oneRow(
    await client
      .insert(users)
      .values({
        ...profileChanges(input),
        id: newId(),
        email: input.email?.trim().toLowerCase() || null,
        role,
        status: 'active',
        canSignIn: false,
        invitedBy: callerUserId(),
      })
      .returning(),
  );

  await recordAudit(client, {
    action: 'user.added',
    targetType: 'user',
    targetId: row.id,
    targetLabel: labelOf(row),
    metadata: { role, canSignIn: false },
  });

  return row;
};

/** Lets a member who doesn't sign in join: they are invited at their email. */
export const allowSignIn = async (target: UserRow, email: string | undefined) => {
  const tx = db();
  const address = email?.trim().toLowerCase() ?? target.email;

  if (target.canSignIn) return target;

  if (!address) throw fail('EMAIL_REQUIRED', 'Give them an email to be invited at');

  const row = oneRow(
    await tx
      .update(users)
      .set({
        email: address,
        canSignIn: true,
        // A disabled member stays disabled; whoever comes back starts invited.
        ...(target.status === 'disabled' ? {} : { status: 'invited' as const }),
        invitedBy: callerUserId(),
        updatedAt: sql`now()`,
      })
      .where(eq(users.id, target.id))
      .returning(),
  );

  if (row.status === 'invited') await sendInvitations(tx, [{ id: row.id, email: address }]);

  await recordAudit(tx, {
    action: 'user.sign_in_allowed',
    targetType: 'user',
    targetId: row.id,
    targetLabel: labelOf(row),
  });

  return row;
};

/** Keeps them on the team without sign-in: sessions, password, two-factor and API keys end. */
export const stopSignIn = async (target: UserRow) => {
  const tx = db();

  if (target.role === 'owner') throw fail('OWNER_SIGNS_IN', 'Owners always sign in');

  if (!target.canSignIn) return target;

  const row = oneRow(
    await tx
      .update(users)
      .set({
        canSignIn: false,
        ...(target.status === 'invited' ? { status: 'active' as const } : {}),
        passwordHash: null,
        totpSecretSealed: null,
        totpPendingSealed: null,
        totpEnabledAt: null,
        recoveryCodes: null,
        sessionVersion: sql`${users.sessionVersion} + 1`,
        updatedAt: sql`now()`,
      })
      .where(eq(users.id, target.id))
      .returning(),
  );

  await tx.delete(apiKeys).where(eq(apiKeys.userId, target.id));
  await recordAudit(tx, {
    action: 'user.sign_in_stopped',
    targetType: 'user',
    targetId: row.id,
    targetLabel: labelOf(row),
  });

  return row;
};

/**
 * A plugin (`users:write`) changes members who don't sign in, never their role: it can't reach
 * an account that signs in. The organisation's team lock keeps it in line with members' changes.
 */
export const asPlugin = async <T>(id: string, fn: (target: UserRow) => Promise<T>) => {
  const tx = db();

  await lockOrganization(tx);

  const target = await findUser(tx, id, true);

  if (target.canSignIn) {
    throw fail('NOT_ALLOWED', 'Plugins change only the members who don’t sign in');
  }

  return fn(target);
};
