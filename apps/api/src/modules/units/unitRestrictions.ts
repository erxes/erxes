import type { UnitKind } from '@erxes/core-contract';
import { callerUserId, type Db, organizations, orgUnitMembers, orgUnits } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { findUser } from '~/modules/users/userRows';

/** The units of `kind` the member is in, with every unit under them; null when they are in none. */
const unitsWithin = async (client: Db, kind: UnitKind, userId: string) => {
  const rows = await client
    .selectDistinct({ id: orgUnits.id })
    .from(orgUnits)
    .where(
      and(
        eq(orgUnits.kind, kind),
        sql`exists (
          select 1 from ${orgUnitMembers} m join ${orgUnits} own on own.id = m.unit_id
          where m.user_id = ${userId} and own.kind = ${kind}
            and ${orgUnits.path} like own.path || '%'
        )`,
      ),
    );

  return rows.length ? rows.map((row) => row.id).toSorted() : null;
};

/**
 * 3.x's `applyDefaultStructureFilter`: with the organisation's team member restrictions on, a
 * member other than an owner keeps to their own branches and departments and the ones under
 * them. A member listed for every unit of a kind, or in none of it, has no limit there (null).
 */
export const memberRestrictionsOf = async (client: Db, input: { userId?: string }) => {
  const userId = input.userId ?? callerUserId();

  if (!userId) {
    const message = 'Name the member';

    throw fail('INVALID_INPUT', message, { issues: [{ path: ['userId'], message }] });
  }

  const member = await findUser(client, userId);

  const { memberRestrictions } = oneRow(
    await client
      .select({ memberRestrictions: organizations.memberRestrictions })
      .from(organizations)
      .limit(1),
  );

  if (!memberRestrictions.enabled || member.role === 'owner') {
    return { branchIds: null, departmentIds: null };
  }

  return {
    branchIds: memberRestrictions.allBranchesUserIds.includes(userId)
      ? null
      : await unitsWithin(client, 'branch', userId),
    departmentIds: memberRestrictions.allDepartmentsUserIds.includes(userId)
      ? null
      : await unitsWithin(client, 'department', userId),
  };
};
