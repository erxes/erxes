import { REACH_PERMISSIONS } from '@erxes/core-contract';
import {
  caller,
  type Db,
  orgUnitMembers,
  orgUnits,
  pluginInstallations,
  plugins,
  type Reach,
  type RoleReach,
  roles,
} from '@erxes/core-db';
import { textArray } from '@erxes/plugin-sdk/filter';
import { and, eq, inArray, type SQL, sql } from 'drizzle-orm';
import { alias, type PgColumn } from 'drizzle-orm/pg-core';
import { fail } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { within } from '~/modules/units/unitPaths';

/**
 * How far the caller reaches (docs/design.md, decision 48). A role says what a member does;
 * its reach says where: the whole organisation, their units and every unit under them, their
 * units alone, or the records they own. Customers, companies, lead history and the recycle bin
 * obey it in the database (`core_reach` policies, drizzle/0090_reach.sql), so no query here
 * filters them, and a record made without units starts where its maker sits.
 * The team and the structure obey it through these conditions: a member sees the units they
 * reach, the units above those by name, and the people in the units they reach. `own` reaches
 * their units there, as `unit` does.
 */

const WIDTH: Record<RoleReach, number> = { own: 0, unit: 1, subtree: 2, organization: 3 };

/** Does `one` reach further than `other`? */
export const reachesFurther = (one: RoleReach, other: RoleReach) => WIDTH[one] > WIDTH[other];

/**
 * The caller's reach when it limits them; null for a member who reaches the whole
 * organisation, a plugin, a customer or core itself.
 */
export const limitedReach = (): (Reach & { userId: string }) | null => {
  const who = caller();

  return who.type === 'user' && who.reach.level !== 'organization'
    ? { ...who.reach, userId: who.userId }
    : null;
};

/**
 * Is the caller shown only some customers and companies: a role that reaches less than the
 * organisation, or an API key with its own limits? Row level security hides the rest; what is
 * kept about a record in another table (its timeline) asks this before listing across records.
 */
export const seesSomeContacts = () => {
  const who = caller();

  return who.type === 'user' && (who.reach.level !== 'organization' || Boolean(who.key));
};

/**
 * A role's permissions as they hold within its reach, read with the role wherever a caller is
 * made: all of them for a role that reaches the organisation; for one that reaches less, core's
 * actions that follow reach and the installed plugins' that their manifests mark `followsReach`.
 * Roles refuse the others when saved; this is what holds when a plugin's update or a default
 * grant put one there anyway.
 */
export const permissionsWithinReach = sql<
  string[]
>`case when ${roles.reach} = 'organization' then ${roles.permissions} else array(
  select held from unnest(${roles.permissions}) as held
  where held = any(${textArray([...REACH_PERMISSIONS])}) or exists (
    select 1 from ${plugins}
    join ${pluginInstallations} on ${pluginInstallations.plugin} = ${plugins.name}
    cross join lateral jsonb_array_elements(coalesce(${plugins.manifest} -> 'permissions', '[]'::jsonb)) as declared
    where ${plugins.status} = 'active' and ${pluginInstallations.status} = 'active'
      and declared ->> 'action' = held and declared ->> 'followsReach' = 'true')) end`;

const top = alias(orgUnits, 'reach_top');
const below = alias(orgUnits, 'reach_below');
const home = alias(orgUnits, 'reach_home');

type UnitColumns = { id: PgColumn; path: PgColumn };

/** Is the unit one the caller reaches? Undefined when nothing limits them. */
export const unitInReach = (unit: UnitColumns, reach = limitedReach()): SQL | undefined => {
  if (!reach) return undefined;

  const mine = textArray([...reach.unitIds]);

  return reach.level === 'subtree'
    ? sql`exists (select 1 from ${orgUnits} ${top} where ${top.id} = any(${mine}) and ${within(unit.path, top.path)})`
    : sql`${unit.id} = any(${mine})`;
};

/**
 * Is the unit one the caller reaches, or above one: the way down to theirs, shown by name
 * without its people. Undefined when nothing limits them.
 */
export const unitShown = (unit: UnitColumns, reach = limitedReach()): SQL | undefined => {
  if (!reach) return undefined;

  return sql`(${unitInReach(unit, reach)} or exists (
    select 1 from ${orgUnits} ${below}
    where ${below.id} = any(${textArray([...reach.unitIds])}) and ${within(below.path, unit.path)}))`;
};

/**
 * Is the member one the caller sees: themselves, or someone in a unit they reach? Undefined
 * when nothing limits them.
 */
export const userInReach = (userId: PgColumn, reach = limitedReach()): SQL | undefined => {
  if (!reach) return undefined;

  return sql`(${userId} = ${reach.userId} or exists (
    select 1 from ${orgUnitMembers}
    join ${orgUnits} ${home} on ${home.id} = ${orgUnitMembers.unitId}
    where ${orgUnitMembers.userId} = ${userId} and ${unitInReach(home, reach)}))`;
};

/**
 * What the caller made themselves (an export, an import): all that a member who reaches less
 * than the organisation sees of them, since each holds records as its maker saw them. Undefined
 * when nothing limits the caller.
 */
export const madeByCaller = (createdBy: PgColumn, reach = limitedReach()): SQL | undefined =>
  reach ? eq(createdBy, reach.userId) : undefined;

const outside = (message: string) => fail('OUTSIDE_REACH', message);

/** 403 OUTSIDE_REACH unless the caller reaches every one of the units. */
export const assertUnitsInReach = async (client: Db, unitIds: readonly string[]) => {
  const reach = limitedReach();
  const wanted = unique([...unitIds]);

  if (!reach || !wanted.length) return;

  const found = await client.$count(
    orgUnits,
    and(inArray(orgUnits.id, wanted), unitInReach(orgUnits, reach)),
  );

  if (found !== wanted.length) throw outside('One of these units is outside your reach');
};

/**
 * 403 OUTSIDE_REACH unless the caller may add, move and delete units: that needs a reach that
 * goes under a unit, since what they add sits under theirs.
 */
export const assertReachesUnder = () => {
  const reach = limitedReach();

  if (reach && reach.level !== 'subtree') {
    throw outside('Your role reaches your own units only: it changes no units under them');
  }
};

/** 403 OUTSIDE_REACH unless the caller reaches the whole organisation (what all of it shares). */
export const assertWholeOrganization = (what: string) => {
  if (limitedReach()) throw outside(`${what} belong to the whole organisation`);
};

/**
 * The units a record ends up in when the caller sets `given`: all of them for a caller nothing
 * limits; for one who reaches less, `given` (each within reach, else 403 OUTSIDE_REACH) and
 * the units the record is in that they don't reach, which they neither see nor change.
 */
export const unitsAfterChange = async (
  client: Db,
  current: readonly string[],
  given: readonly string[],
) => {
  const reach = limitedReach();
  const wanted = unique([...given]);

  if (!reach) return wanted;

  await assertUnitsInReach(client, wanted);

  const kept = current.length
    ? await client
        .select({ id: orgUnits.id })
        .from(orgUnits)
        .where(and(inArray(orgUnits.id, [...current]), sql`not ${unitInReach(orgUnits, reach)}`))
    : [];

  return unique([...wanted, ...kept.map((unit) => unit.id)]);
};

/**
 * The units a new record is given (each within reach). Undefined leaves it to the column: where
 * the caller sits (`unitIdsColumn`).
 */
export const unitsForNew = (client: Db, given: readonly string[] | undefined) =>
  given ? unitsAfterChange(client, [], given) : undefined;

/** Records in the unit or a unit under it (`visible_to` holds `u:<unit>` for each unit above a record's). */
export const inUnit = (visibleTo: PgColumn, unitId: string) =>
  sql`${visibleTo} @> ${textArray([`u:${unitId}`])}`;

/** The units the member is in. */
export const unitIdsOf = async (client: Db, userId: string) => {
  const rows = await client
    .select({ unitId: orgUnitMembers.unitId })
    .from(orgUnitMembers)
    .where(eq(orgUnitMembers.userId, userId));

  return rows.map((row) => row.unitId);
};
