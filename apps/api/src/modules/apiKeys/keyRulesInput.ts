import {
  API_KEY_AREA_INFO,
  API_KEY_AREAS,
  type ApiKeyAreas,
  CORE_PERMISSIONS,
  OWNER_ONLY_PERMISSIONS,
} from '@erxes/core-contract';
import { type Caller, type Db, orgUnits, tags } from '@erxes/core-db';
import { inArray } from 'drizzle-orm';
import { can } from '~/http/access';
import { fail } from '~/http/errors';
import { AREA_PERMISSIONS, kindOf } from '~/http/keyRules';

type Member = Extract<Caller, { type: 'user' }>;

export interface KeyRulesInput {
  kind: 'regular' | 'management';
  areas: ApiKeyAreas;
  ownRecords: boolean;
  unitIds: string[];
  tagIds: string[];
  allowedIps: string[];
}

const invalid = (field: string, message: string) =>
  fail('INVALID_INPUT', message, { issues: [{ path: [field], message }] });

const OWNER_ONLY = new Set(OWNER_ONLY_PERMISSIONS);

/** What the member may do now, spelled out: a key keeps this list, not a role or `*`. */
const permissionsOf = (member: Member) => {
  const core = CORE_PERMISSIONS.map((permission) => permission.action).filter(
    (action) => member.role === 'owner' || can(member, action),
  );

  const own = member.permissions.filter((action) => action !== '*' && !OWNER_ONLY.has(action));

  return [...new Set([...core, ...own])];
};

const missing = async (client: Db, table: typeof tags | typeof orgUnits, ids: string[]) => {
  if (!ids.length) return false;

  const rows = await client.select({ id: table.id }).from(table).where(inArray(table.id, ids));

  return rows.length < new Set(ids).size;
};

/**
 * Refuses rules the maker can't give: a management key from anyone but an owner or admin,
 * an area of the other kind, an area the maker's role lacks, limits on a management key,
 * units or tags the organisation doesn't have.
 */
export const checkKeyRules = async (client: Db, me: Member, input: KeyRulesInput) => {
  if (input.kind === 'management' && me.role !== 'owner' && me.role !== 'admin') {
    throw fail('OWNER_ONLY', 'Only an owner or admin can make a management key');
  }

  const opened = API_KEY_AREAS.filter((area) => input.areas[area]);

  if (!opened.length) throw invalid('areas', 'Choose at least one area');

  for (const area of opened) {
    const { label } = API_KEY_AREA_INFO[area];
    const access = input.areas[area];

    if (kindOf(area) !== input.kind) {
      throw invalid('areas', `${label} isn't for a ${input.kind} key`);
    }

    const { read, write } = AREA_PERMISSIONS[area];
    const lacksWrite = access === 'write' && write.length > 0 && !write.some((p) => can(me, p));

    if (access === 'write' && 'readOnly' in API_KEY_AREA_INFO[area]) {
      throw invalid('areas', `Keys only read ${label}`);
    }

    if (!read.every((permission) => can(me, permission)) || lacksWrite) {
      throw fail('BEYOND_OWN_PERMISSIONS', `You can't give ${label}: your role doesn't allow it`, {
        permissions: [...read, ...(access === 'write' ? write : [])],
      });
    }
  }

  const limited = input.ownRecords || input.unitIds.length > 0 || input.tagIds.length > 0;

  if (input.kind === 'management' && limited) {
    throw invalid('kind', "Management keys can't read contacts, so they take no contact limits");
  }

  const unlimited = opened.find((area) => 'outsideContactLimits' in API_KEY_AREA_INFO[area]);

  if (limited && unlimited) {
    throw invalid(
      'areas',
      `${API_KEY_AREA_INFO[unlimited].label} don't follow contact limits: a limited key opens contacts and products only`,
    );
  }

  if (await missing(client, orgUnits, input.unitIds)) throw invalid('unitIds', 'Unit not found');

  if (await missing(client, tags, input.tagIds)) throw invalid('tagIds', 'Tag not found');
};

/** The columns the rules set, with the maker's permissions as they are now. */
export const ruleColumns = (me: Member, input: KeyRulesInput) => ({
  kind: input.kind,
  areas: input.areas,
  ownRecords: input.ownRecords,
  unitIds: [...new Set(input.unitIds)],
  tagIds: [...new Set(input.tagIds)],
  allowedIps: [...new Set(input.allowedIps)],
  permissions: permissionsOf(me),
});
