import { caller, type Db, roles, runAs, users } from '@erxes/core-db';
import { and, count, eq, ne } from 'drizzle-orm';
import { can } from '~/http/access';
import { fail, notFound } from '~/http/errors';
import { lockOrganization } from '~/lib/locks';
import { permissionsWithinReach, unitIdsOf, userInReach } from '~/modules/reach/reach';

export type UserRow = typeof users.$inferSelect;

/**
 * Changing someone else on the team needs `team.manage` (the policy lets any
 * member edit their own profile). Read under `lockTeam`, so a manager demoted
 * a moment ago is already refused.
 */
export const assertTeamManager = () => {
  if (!can(caller('user'), 'team.manage')) {
    throw fail('NOT_ALLOWED', "Your role doesn't allow this", {
      permission: 'team.manage',
    });
  }
};

/**
 * Team changes run one at a time per organisation (a lock on its row), and
 * `fn` runs as the caller with their role read again inside: two owners
 * demoting each other at the same moment can't both win and leave nobody in
 * charge.
 */
export const lockTeam = async <T>(tx: Db, fn: () => Promise<T>) => {
  await lockOrganization(tx);

  const me = caller('user');

  const [row] = await tx
    .select({
      role: users.role,
      status: users.status,
      permissions: permissionsWithinReach,
      level: roles.reach,
    })
    .from(users)
    .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
    .where(eq(users.id, me.userId))
    .limit(1);

  if (!row || row.status !== 'active') {
    throw fail('UNAUTHORIZED', 'Sign in to continue');
  }

  const reach = { level: row.level, unitIds: await unitIdsOf(tx, me.userId) };

  return runAs({ ...me, role: row.role, permissions: row.permissions, reach }, fn);
};

/** The team member, when within the caller's reach: 404 otherwise. */
export const findUser = async (client: Db, id: string, lock = false) => {
  const query = client
    .select()
    .from(users)
    .where(and(eq(users.id, id), userInReach(users.id)))
    .limit(1);

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
