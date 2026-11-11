import { Db, newId, users, withTransaction } from '@erxes/core-db';
import type { CursorQuery } from '@erxes/core-contract';
import { and, count, eq, ilike, inArray, ne, or, SQL, sql } from 'drizzle-orm';
import { type Actor, type Role, requireManager } from '~/http/auth';
import { forbidden, HttpError, notFound, pgCode } from '~/http/errors';
import { containsPattern, keysetPage } from '~/lib/keyset';

type UserRow = typeof users.$inferSelect;
type Status = UserRow['status'];

/** The API shape: never the password hash or internal flags. */
export const toUserDto = (row: UserRow) => ({
  id: row.id,
  email: row.email,
  username: row.username,
  fullName: row.fullName,
  avatarUrl: row.avatarUrl,
  role: row.role,
  status: row.status,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

const requireTeamManager = (actor: Actor) =>
  requireManager(actor, 'Only owners and admins can manage team members');

/** Unique email or username in the organisation → 409 with the field. */
const conflictFrom = (error: unknown): never => {
  if (pgCode(error) === '23505') {
    throw new HttpError(409, 'EMAIL_TAKEN', 'A team member with this email already exists');
  }

  throw error;
};

const findUser = async (client: Db, orgId: string, id: string, lock = false) => {
  const query = client
    .select()
    .from(users)
    .where(and(eq(users.orgId, orgId), eq(users.id, id)))
    .limit(1);
  const [row] = lock ? await query.for('update') : await query;

  if (!row) {
    throw notFound('Team member');
  }

  return row;
};

/** Other active owners besides `exceptId` (an organisation always keeps one). */
const otherActiveOwners = async (client: Db, orgId: string, exceptId: string) => {
  const [result] = await client
    .select({ total: count() })
    .from(users)
    .where(
      and(
        eq(users.orgId, orgId),
        eq(users.role, 'owner'),
        eq(users.status, 'active'),
        ne(users.id, exceptId),
      ),
    );

  return result?.total ?? 0;
};

export const listUsers = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & { search?: string; status?: Status; role?: Role; ids?: string[] },
) => {
  const filters: (SQL | undefined)[] = [];

  if (query.status) {
    filters.push(eq(users.status, query.status));
  }

  if (query.role) {
    filters.push(eq(users.role, query.role));
  }

  if (query.ids) {
    filters.push(inArray(users.id, query.ids.length ? query.ids : ['']));
  }

  if (query.search) {
    const pattern = containsPattern(query.search);
    filters.push(
      or(
        ilike(users.email, pattern),
        ilike(users.fullName, pattern),
        ilike(users.username, pattern),
      ),
    );
  }

  const page = await keysetPage(
    client,
    { table: users, id: users.id, createdAt: users.createdAt, scope: eq(users.orgId, actor.orgId) },
    and(...filters),
    query,
    (where, orderBy, limit) =>
      client.select().from(users).where(where).orderBy(...orderBy).limit(limit),
  );

  return { ...page, data: page.data.map(toUserDto) };
};

export const getUser = async (client: Db, actor: Actor, id: string) =>
  toUserDto(await findUser(client, actor.orgId, id));

export const inviteUser = async (
  client: Db,
  actor: Actor,
  input: { email: string; role: Exclude<Role, 'owner'>; fullName?: string; username?: string },
) => {
  requireTeamManager(actor);

  try {
    const [row] = await client
      .insert(users)
      .values({
        id: newId(),
        orgId: actor.orgId,
        email: input.email.trim().toLowerCase(),
        fullName: input.fullName ?? null,
        username: input.username ?? null,
        role: input.role,
        status: 'invited',
        invitedBy: actor.userId,
      })
      .returning();

    return toUserDto(row!);
  } catch (error) {
    return conflictFrom(error);
  }
};

export const updateUser = async (
  actor: Actor,
  id: string,
  input: { fullName?: string; username?: string; avatarUrl?: string | null; role?: Role },
) =>
  withTransaction(async (tx) => {
    const target = await findUser(tx, actor.orgId, id, true);
    const self = target.id === actor.userId;

    if (!self) {
      requireTeamManager(actor);
    }

    if (input.role && input.role !== target.role) {
      if (self) {
        throw forbidden('OWN_ROLE', 'You cannot change your own role');
      }

      requireTeamManager(actor);

      // Only owners grant or remove owner rights.
      if ((input.role === 'owner' || target.role === 'owner') && actor.role !== 'owner') {
        throw forbidden('OWNER_ONLY', 'Only an owner can change owner rights');
      }

      if (
        target.role === 'owner' &&
        target.status === 'active' &&
        (await otherActiveOwners(tx, actor.orgId, target.id)) === 0
      ) {
        throw new HttpError(409, 'LAST_OWNER', 'The organisation must keep an active owner');
      }
    }

    try {
      const [row] = await tx
        .update(users)
        .set({
          ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
          ...(input.username !== undefined ? { username: input.username } : {}),
          ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
          ...(input.role !== undefined ? { role: input.role } : {}),
          updatedAt: sql`now()`,
        })
        .where(and(eq(users.orgId, actor.orgId), eq(users.id, id)))
        .returning();

      return toUserDto(row!);
    } catch (error) {
      return conflictFrom(error);
    }
  });

export const setUserDisabled = async (actor: Actor, id: string, disabled: boolean) =>
  withTransaction(async (tx) => {
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

    const [row] = await tx
      .update(users)
      .set({ status, updatedAt: sql`now()` })
      .where(and(eq(users.orgId, actor.orgId), eq(users.id, id)))
      .returning();

    return toUserDto(row!);
  });
