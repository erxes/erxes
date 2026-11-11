import { Db, newId, users, withTransaction } from '@erxes/core-db';
import type { CursorQuery, UserLinkName } from '@erxes/core-contract';
import { and, count, eq, ilike, inArray, ne, or, SQL, sql } from 'drizzle-orm';
import { type Actor, type Role, requireManager } from '~/http/auth';
import { forbidden, HttpError, notFound, pgCode } from '~/http/errors';
import { containsPattern, keysetPage } from '~/lib/keyset';
import { hashPassword } from '~/modules/auth/password';

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
  firstName: row.firstName,
  middleName: row.middleName,
  lastName: row.lastName,
  shortName: row.shortName,
  employeeId: row.employeeId,
  phone: row.phone,
  birthDate: row.birthDate,
  workStartedDate: row.workStartedDate,
  description: row.description,
  links: row.links,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

type NameParts = Pick<UserRow, 'firstName' | 'middleName' | 'lastName'>;

/** First word → first name, the rest → last name (as the 0003 migration did). */
const splitFullName = (fullName: string): NameParts => {
  const [first = '', ...rest] = fullName.trim().split(/\s+/);

  return { firstName: first || null, middleName: null, lastName: rest.join(' ') || null };
};

const joinName = ({ firstName, middleName, lastName }: NameParts) =>
  [firstName, middleName, lastName].filter(Boolean).join(' ') || null;

/** Empty text clears a field. */
const blankToNull = (value: string | null | undefined) =>
  value === undefined ? undefined : value?.trim() ? value.trim() : null;

/** Name, profile and link changes, with `fullName` kept in step with the name parts. */
const profileChanges = (
  input: UserChanges,
  current?: Pick<UserRow, 'firstName' | 'middleName' | 'lastName' | 'links'>,
) => {
  const set: Partial<typeof users.$inferInsert> = {};
  const parts = {
    firstName: blankToNull(input.firstName),
    middleName: blankToNull(input.middleName),
    lastName: blankToNull(input.lastName),
  };
  const partsGiven = Object.values(parts).some((value) => value !== undefined);

  if (partsGiven) {
    const next: NameParts = {
      firstName: parts.firstName === undefined ? (current?.firstName ?? null) : parts.firstName,
      middleName: parts.middleName === undefined ? (current?.middleName ?? null) : parts.middleName,
      lastName: parts.lastName === undefined ? (current?.lastName ?? null) : parts.lastName,
    };

    Object.assign(set, next, { fullName: input.fullName ?? joinName(next) });
  } else if (input.fullName !== undefined) {
    Object.assign(set, splitFullName(input.fullName), { fullName: input.fullName });
  }

  for (const key of ['shortName', 'employeeId', 'phone', 'description'] as const) {
    const value = blankToNull(input[key]);

    if (value !== undefined) {
      set[key] = value;
    }
  }

  for (const key of ['birthDate', 'workStartedDate'] as const) {
    if (input[key] !== undefined) {
      set[key] = input[key];
    }
  }

  if (input.links) {
    const links: Record<string, string> = { ...(current?.links ?? {}) };

    for (const [name, value] of Object.entries(input.links)) {
      if (value?.trim()) {
        links[name] = value.trim();
      } else {
        delete links[name];
      }
    }

    set.links = links;
  }

  if (input.username !== undefined) {
    set.username = input.username;
  }

  if (input.avatarUrl !== undefined) {
    set.avatarUrl = input.avatarUrl;
  }

  return set;
};

interface UserChanges {
  email?: string;
  fullName?: string;
  username?: string;
  avatarUrl?: string | null;
  role?: Role;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  shortName?: string | null;
  employeeId?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  workStartedDate?: string | null;
  description?: string | null;
  links?: Partial<Record<UserLinkName, string | null>>;
}

interface InviteInput {
  email: string;
  role: Exclude<Role, 'owner'>;
  password?: string;
  fullName?: string;
  username?: string;
}

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
  query: CursorQuery & { search?: string; status?: Status; isActive?: boolean; role?: Role; ids?: string[] },
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
    const pattern = containsPattern(query.search);
    filters.push(
      or(
        ilike(users.email, pattern),
        ilike(users.fullName, pattern),
        ilike(users.username, pattern),
        ilike(users.shortName, pattern),
        ilike(users.employeeId, pattern),
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

/** A new member row: with a password they can sign in at once, otherwise they stay invited. */
const inviteValues = async (actor: Actor, input: InviteInput) => ({
  id: newId(),
  orgId: actor.orgId,
  email: input.email.trim().toLowerCase(),
  ...(input.fullName ? { ...splitFullName(input.fullName), fullName: input.fullName } : {}),
  username: input.username ?? null,
  role: input.role,
  status: input.password ? ('active' as const) : ('invited' as const),
  passwordHash: input.password ? await hashPassword(input.password) : null,
  invitedBy: actor.userId,
});

export const inviteUser = async (client: Db, actor: Actor, input: InviteInput) => {
  requireTeamManager(actor);

  try {
    const [row] = await client.insert(users).values(await inviteValues(actor, input)).returning();

    return toUserDto(row!);
  } catch (error) {
    return conflictFrom(error);
  }
};

/** Several invitations in one go: all are created, or none (409 names the taken emails). */
export const inviteUsers = async (actor: Actor, entries: InviteInput[]) => {
  requireTeamManager(actor);

  const emails = entries.map((entry) => entry.email.trim().toLowerCase());
  const repeated = emails.filter((email, index) => emails.indexOf(email) !== index);

  if (repeated.length) {
    throw new HttpError(409, 'EMAIL_TAKEN', `Invited twice: ${[...new Set(repeated)].join(', ')}`, {
      emails: [...new Set(repeated)],
    });
  }

  const values = await Promise.all(entries.map((entry) => inviteValues(actor, entry)));

  return withTransaction(async (tx) => {
    const taken = await tx
      .select({ email: users.email })
      .from(users)
      .where(and(eq(users.orgId, actor.orgId), inArray(sql`lower(${users.email})`, emails)));

    if (taken.length) {
      const list = taken.map(({ email }) => email.toLowerCase());

      throw new HttpError(409, 'EMAIL_TAKEN', `Already a team member: ${list.join(', ')}`, { emails: list });
    }

    try {
      const rows = await tx.insert(users).values(values).returning();

      return { data: rows.map(toUserDto) };
    } catch (error) {
      return conflictFrom(error);
    }
  });
};

export const updateUser = async (actor: Actor, id: string, input: UserChanges) =>
  withTransaction(async (tx) => {
    const target = await findUser(tx, actor.orgId, id, true);
    const self = target.id === actor.userId;

    if (!self) {
      requireTeamManager(actor);
    }

    const email = input.email?.trim().toLowerCase();

    // An owner's email is how they sign in: only owners change it.
    if (email && email !== target.email && !self && target.role === 'owner' && actor.role !== 'owner') {
      throw forbidden('OWNER_ONLY', 'Only an owner can change an owner’s email');
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
          ...profileChanges(input, target),
          ...(email !== undefined ? { email } : {}),
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

/** Old erxes "Reset password": a manager sets another member's password. */
export const setUserPassword = async (actor: Actor, id: string, password: string) => {
  requireTeamManager(actor);

  const passwordHash = await hashPassword(password);

  return withTransaction(async (tx) => {
    const target = await findUser(tx, actor.orgId, id, true);

    if (target.id === actor.userId) {
      throw forbidden('OWN_ACCOUNT', 'Change your own password from your profile');
    }

    if (target.role === 'owner' && actor.role !== 'owner') {
      throw forbidden('OWNER_ONLY', 'Only an owner can set an owner’s password');
    }

    const [row] = await tx
      .update(users)
      .set({
        passwordHash,
        // Someone invited can sign in now; a disabled member stays disabled.
        ...(target.status === 'invited' ? { status: 'active' as const } : {}),
        updatedAt: sql`now()`,
      })
      .where(and(eq(users.orgId, actor.orgId), eq(users.id, id)))
      .returning();

    return toUserDto(row!);
  });
};

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
