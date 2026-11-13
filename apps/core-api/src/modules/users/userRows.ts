import { type Db, roles, users } from '@erxes/core-db';
import { and, count, eq, ne } from 'drizzle-orm';
import { type Actor, requirePermission } from '~/http/auth';
import { HttpError, notFound, pgCode } from '~/http/errors';
import { lockOrganization } from '~/lib/locks';

export type UserRow = typeof users.$inferSelect;

/** The API shape: never the password hash or internal flags. */
export const toUserDto = (row: UserRow) => ({
  id: row.id,
  email: row.email,
  username: row.username,
  fullName: row.fullName,
  avatarUrl: row.avatarUrl,
  role: row.role,
  twoFactorEnabled: Boolean(row.totpEnabledAt),
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
  onboardedAt: row.onboardedAt?.toISOString() ?? null,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const requireTeamManager = (
  actor: Actor,
  action: 'team.manage' | 'team.invite' = 'team.manage',
) => requirePermission(actor, action);

/**
 * Team changes run one at a time per organisation (a lock on its row), with
 * the caller's role read again inside: two owners demoting each other at the
 * same moment can't both win and leave nobody in charge.
 */
export const lockTeam = async (tx: Db, actor: Actor): Promise<Actor> => {
  await lockOrganization(tx, actor.orgId);

  const [me] = await tx
    .select({ role: users.role, status: users.status, permissions: roles.permissions })
    .from(users)
    .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
    .where(eq(users.id, actor.userId))
    .limit(1);

  if (!me || me.status !== 'active') {
    throw new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue');
  }

  return { ...actor, role: me.role, permissions: me.permissions };
};

/** A unique email or username in the organisation → 409. */
export const conflictFrom = (error: unknown): never => {
  if (pgCode(error) === '23505') {
    throw new HttpError(409, 'EMAIL_TAKEN', 'A team member with this email already exists');
  }

  throw error;
};

export const findUser = async (client: Db, id: string, lock = false) => {
  const query = client.select().from(users).where(eq(users.id, id)).limit(1);

  const [row] = lock ? await query.for('update') : await query;

  if (!row) {
    throw notFound('Team member');
  }

  return row;
};

/** Other active owners besides `exceptId` (an organisation always keeps one). */
export const otherActiveOwners = async (client: Db, exceptId: string) => {
  const [result] = await client
    .select({ total: count() })
    .from(users)
    .where(and(eq(users.role, 'owner'), eq(users.status, 'active'), ne(users.id, exceptId)));

  return result?.total ?? 0;
};
