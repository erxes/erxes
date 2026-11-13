import type { CursorQuery } from '@erxes/core-contract';
import { db, type Db, users } from '@erxes/core-db';
import { and, eq, ilike, inArray, ne, or, type SQL, sql } from 'drizzle-orm';
import { type Actor, type Role, userCaller } from '~/http/auth';
import { forbidden, HttpError } from '~/http/errors';
import { diffRows } from '~/lib/changes';
import { keysetPage } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { matchEveryWord } from '~/lib/search';
import { recordAudit } from '~/modules/audit/audit.service';
import { hashPassword } from '~/lib/crypto';
import { notify } from '~/modules/notifications/notifications.service';
import { assertAssignable } from '~/modules/roles/roles.service';
import { profileChanges, type UserChanges } from './userProfile';
import {
  conflictFrom,
  findUser,
  lockTeam,
  otherActiveOwners,
  requireTeamManager,
  toUserDto,
  type UserRow,
} from './userRows';

type Status = UserRow['status'];

export const listUsers = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & {
    search?: string;
    status?: Status;
    isActive?: boolean;
    role?: Role;
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

  const page = await keysetPage(
    client,
    { table: users, id: users.id, createdAt: users.createdAt, scope: eq(users.orgId, actor.orgId) },
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

  return { ...page, data: page.data.map(toUserDto) };
};

export const getUser = async (client: Db, actor: Actor, id: string) =>
  toUserDto(await findUser(client, actor.orgId, id));

/** Who may change `target`'s email and role: owners guard owners, nobody changes their own role. */
const checkUserChange = async (
  tx: Db,
  actor: Actor,
  target: UserRow,
  change: { email?: string; role?: Role },
) => {
  const self = target.id === actor.userId;

  if (!self) {
    requireTeamManager(actor);
  }

  // An owner's email is how they sign in: only owners change it.
  const ownerEmail = change.email && change.email !== target.email && target.role === 'owner';

  if (ownerEmail && !self && actor.role !== 'owner') {
    throw forbidden('OWNER_ONLY', 'Only an owner can change an owner’s email');
  }

  if (!change.role || change.role === target.role) {
    return;
  }

  if (self) {
    throw forbidden('OWN_ROLE', 'You cannot change your own role');
  }

  // Only owners grant or remove owner rights.
  if ((change.role === 'owner' || target.role === 'owner') && actor.role !== 'owner') {
    throw forbidden('OWNER_ONLY', 'Only an owner can change owner rights');
  }

  // The role exists, and gives nothing beyond what the assigner can do.
  await assertAssignable(tx, actor, change.role);

  if (
    target.role === 'owner' &&
    target.status === 'active' &&
    (await otherActiveOwners(tx, actor.orgId, target.id)) === 0
  ) {
    throw new HttpError(409, 'LAST_OWNER', 'The organisation must keep an active owner');
  }
};

/** Audits a member's change, and tells them when someone else changed their role. */
const announceUserChange = async (tx: Db, actor: Actor, before: UserRow, after: UserRow) => {
  const changes = diffRows(before, after, ['lastSeenAt']);

  if (!changes) {
    return;
  }

  if (changes.role && before.id !== actor.userId) {
    await notify(tx, userCaller(actor), {
      userIds: [after.id],
      kind: 'core.user.role_changed',
      title: 'Your role was changed',
      body: `${before.role} → ${after.role}`,
      priority: 'high',
      entity: { type: 'user', id: after.id },
      data: { changes: { role: changes.role } },
    });
  }

  await recordAudit(tx, userCaller(actor), {
    action: changes.role ? 'user.role_changed' : 'user.updated',
    targetType: 'user',
    targetId: after.id,
    targetLabel: after.email,
    changes,
  });
};

export const updateUser = async (caller: Actor, id: string, input: UserChanges) => {
  const tx = db();

  const actor = await lockTeam(tx, caller);
  const target = await findUser(tx, actor.orgId, id, true);
  const email = input.email?.trim().toLowerCase();

  await checkUserChange(tx, actor, target, { email, role: input.role });

  try {
    const row = oneRow(
      await tx
        .update(users)
        .set({
          ...profileChanges(input, target),
          ...(email !== undefined ? { email } : {}),
          ...(input.role !== undefined ? { role: input.role } : {}),
          updatedAt: sql`now()`,
        })
        .where(and(eq(users.orgId, actor.orgId), eq(users.id, id)))
        .returning(),
    );

    await announceUserChange(tx, actor, target, row);

    return toUserDto(row);
  } catch (error) {
    return conflictFrom(error);
  }
};

/** Old erxes "Reset password": a manager sets another member's password. */
export const setUserPassword = async (caller: Actor, id: string, password: string) => {
  requireTeamManager(caller);

  const passwordHash = await hashPassword(password);

  const tx = db();

  const actor = await lockTeam(tx, caller);

  requireTeamManager(actor);

  const target = await findUser(tx, actor.orgId, id, true);

  if (target.id === actor.userId) {
    throw forbidden('OWN_ACCOUNT', 'Change your own password from your profile');
  }

  if (target.role === 'owner' && actor.role !== 'owner') {
    throw forbidden('OWNER_ONLY', 'Only an owner can set an owner’s password');
  }

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
      .where(and(eq(users.orgId, actor.orgId), eq(users.id, id)))
      .returning(),
  );

  await notify(tx, userCaller(actor), {
    userIds: [id],
    kind: 'core.user.password_set',
    title: 'Your password was changed by an admin',
    body: 'If you did not ask for this, contact an owner of your organisation.',
    priority: 'high',
    entity: { type: 'user', id },
  });
  await recordAudit(tx, userCaller(actor), {
    action: 'user.password_set',
    targetType: 'user',
    targetId: id,
    targetLabel: row.email,
  });

  return toUserDto(row);
};

export const setUserDisabled = async (caller: Actor, id: string, disabled: boolean) => {
  const tx = db();

  const actor = await lockTeam(tx, caller);

  requireTeamManager(actor);

  const target = await findUser(tx, actor.orgId, id, true);

  if (target.id === actor.userId) {
    throw forbidden('OWN_ACCOUNT', 'You cannot disable or enable your own account');
  }

  if (target.role === 'owner' && actor.role !== 'owner') {
    throw forbidden('OWNER_ONLY', 'Only an owner can disable or enable an owner');
  }

  if (
    disabled &&
    target.role === 'owner' &&
    (await otherActiveOwners(tx, actor.orgId, target.id)) === 0
  ) {
    throw new HttpError(409, 'LAST_OWNER', 'The organisation must keep an active owner');
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
      .where(and(eq(users.orgId, actor.orgId), eq(users.id, id)))
      .returning(),
  );

  await recordAudit(tx, userCaller(actor), {
    action: disabled ? 'user.disabled' : 'user.enabled',
    targetType: 'user',
    targetId: id,
    targetLabel: row.email,
    changes: { status: [target.status, status] },
  });

  return toUserDto(row);
};
