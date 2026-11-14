import type { CursorQuery } from '@erxes/core-contract';
import { caller, db, type Db, users } from '@erxes/core-db';
import { and, eq, ilike, inArray, ne, or, type SQL, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { diffRows } from '~/lib/changes';
import { keysetPage } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { matchEveryWord } from '~/lib/search';
import { recordAudit } from '~/modules/audit/audit.service';
import { hashPassword } from '~/lib/crypto';
import { notify } from '~/modules/notifications/notifications.service';
import { assertAssignable } from '~/modules/roles/roles.service';
import { profileChanges, type UserChanges } from './userProfile';
import { assertTeamManager, findUser, lockTeam, otherActiveOwners, type UserRow } from './userRows';

type Status = UserRow['status'];

export const listUsers = async (
  client: Db,
  query: CursorQuery & {
    search?: string;
    status?: Status;
    isActive?: boolean;
    role?: string;
    ids?: string[];
  },
) => {
  const filters: (SQL | undefined)[] = [];

  if (query.status) {
    filters.push(eq(users.status, query.status));
  }

  if (query.isActive !== undefined) {
    filters.push(query.isActive ? ne(users.status, 'disabled') : eq(users.status, 'disabled'));
  }

  if (query.role) {
    filters.push(eq(users.role, query.role));
  }

  if (query.ids) {
    filters.push(inArray(users.id, query.ids.length ? query.ids : ['']));
  }

  if (query.search) {
    filters.push(
      matchEveryWord(query.search, (pattern) =>
        or(
          ilike(users.email, pattern),
          ilike(users.fullName, pattern),
          ilike(users.username, pattern),
          ilike(users.shortName, pattern),
          ilike(users.employeeId, pattern),
        ),
      ),
    );
  }

  return keysetPage(
    client,
    { table: users, id: users.id, createdAt: users.createdAt },
    and(...filters),
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(users)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );
};

export const getUser = (client: Db, id: string) => findUser(client, id);

/** Who may change `target`'s email and role: owners guard owners, nobody changes their own role. */
const checkUserChange = async (
  tx: Db,
  target: UserRow,
  change: { email?: string; role?: string },
) => {
  const me = caller('user');
  const self = target.id === me.userId;

  if (!self) {
    assertTeamManager();
  }

  // An owner's email is how they sign in: only owners change it.
  const ownerEmail = change.email && change.email !== target.email && target.role === 'owner';

  if (ownerEmail && !self && me.role !== 'owner') {
    throw fail('OWNER_ONLY', 'Only an owner can change an owner’s email');
  }

  if (!change.role || change.role === target.role) {
    return;
  }

  if (self) {
    throw fail('OWN_ROLE', 'You cannot change your own role');
  }

  // Only owners grant or remove owner rights.
  if ((change.role === 'owner' || target.role === 'owner') && me.role !== 'owner') {
    throw fail('OWNER_ONLY', 'Only an owner can change owner rights');
  }

  // The role exists, and gives nothing beyond what the assigner can do.
  await assertAssignable(tx, change.role);

  if (
    target.role === 'owner' &&
    target.status === 'active' &&
    (await otherActiveOwners(tx, target.id)) === 0
  ) {
    throw fail('LAST_OWNER', 'The organisation must keep an active owner');
  }
};

/** Audits a member's change, and tells them when someone else changed their role. */
const announceUserChange = async (tx: Db, before: UserRow, after: UserRow) => {
  const changes = diffRows(before, after, ['lastSeenAt']);

  if (!changes) {
    return;
  }

  if (changes.role && before.id !== caller('user').userId) {
    await notify(tx, {
      userIds: [after.id],
      kind: 'core.user.role_changed',
      title: 'Your role was changed',
      body: `${before.role} → ${after.role}`,
      priority: 'high',
      entityType: 'user',
      entityId: after.id,
      data: { changes: { role: changes.role } },
    });
  }

  await recordAudit(tx, {
    action: changes.role ? 'user.role_changed' : 'user.updated',
    targetType: 'user',
    targetId: after.id,
    targetLabel: after.email,
    changes,
  });
};

export const updateUser = async (id: string, input: UserChanges) => {
  const tx = db();

  return lockTeam(tx, async () => {
    const target = await findUser(tx, id, true);
    const email = input.email?.trim().toLowerCase();

    await checkUserChange(tx, target, { email, role: input.role });

    const row = oneRow(
      await tx
        .update(users)
        .set({
          ...profileChanges(input, target),
          email,
          role: input.role,
          updatedAt: sql`now()`,
        })
        .where(eq(users.id, id))
        .returning(),
    );

    await announceUserChange(tx, target, row);

    return row;
  });
};

/**
 * Under the team lock: a manager acting on another member, where only owners
 * act on owners. `fn` gets the locked target row.
 */
const manageMember = <T>(
  tx: Db,
  id: string,
  refusals: { self: string; owner: string },
  fn: (target: UserRow) => Promise<T>,
) =>
  lockTeam(tx, async () => {
    assertTeamManager();

    const me = caller('user');
    const target = await findUser(tx, id, true);

    if (target.id === me.userId) {
      throw fail('OWN_ACCOUNT', refusals.self);
    }

    if (target.role === 'owner' && me.role !== 'owner') {
      throw fail('OWNER_ONLY', refusals.owner);
    }

    return fn(target);
  });

/** Old erxes "Reset password": a manager sets another member's password. */
export const setUserPassword = async (id: string, password: string) => {
  const passwordHash = await hashPassword(password);
  const tx = db();

  return manageMember(
    tx,
    id,
    {
      self: 'Change your own password from your profile',
      owner: 'Only an owner can set an owner’s password',
    },
    async (target) => {
      const row = oneRow(
        await tx
          .update(users)
          .set({
            passwordHash,
            // Their sessions end: whoever had the old password is out.
            sessionVersion: sql`${users.sessionVersion} + 1`,
            // Someone invited can sign in now; a disabled member stays disabled.
            ...(target.status === 'invited' ? { status: 'active' as const } : {}),
            updatedAt: sql`now()`,
          })
          .where(eq(users.id, id))
          .returning(),
      );

      await notify(tx, {
        userIds: [id],
        kind: 'core.user.password_set',
        title: 'Your password was changed by an admin',
        body: 'If you did not ask for this, contact an owner of your organisation.',
        priority: 'high',
        entityType: 'user',
        entityId: id,
      });
      await recordAudit(tx, {
        action: 'user.password_set',
        targetType: 'user',
        targetId: id,
        targetLabel: row.email,
      });

      return row;
    },
  );
};

export const setUserDisabled = async (id: string, disabled: boolean) => {
  const tx = db();

  return manageMember(
    tx,
    id,
    {
      self: 'You cannot disable or enable your own account',
      owner: 'Only an owner can disable or enable an owner',
    },
    async (target) => {
      if (disabled && target.role === 'owner' && (await otherActiveOwners(tx, target.id)) === 0) {
        throw fail('LAST_OWNER', 'The organisation must keep an active owner');
      }

      // Enabling returns a member to where they were: someone invited who never
      // set a password is still invited; everyone else is active again.
      const status: Status = disabled
        ? 'disabled'
        : target.invitedBy && !target.passwordHash
          ? 'invited'
          : 'active';

      const row = oneRow(
        await tx
          .update(users)
          // Either way old sessions end: enabling doesn't bring back tokens issued before.
          .set({ status, sessionVersion: sql`${users.sessionVersion} + 1`, updatedAt: sql`now()` })
          .where(eq(users.id, id))
          .returning(),
      );

      await recordAudit(tx, {
        action: disabled ? 'user.disabled' : 'user.enabled',
        targetType: 'user',
        targetId: id,
        targetLabel: row.email,
        changes: { status: [target.status, status] },
      });

      return row;
    },
  );
};
