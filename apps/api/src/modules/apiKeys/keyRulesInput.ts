import {
  API_KEY_AREA_INFO,
  API_KEY_AREAS,
  type ApiKeyAreas,
  type ApiKeyPlugins,
  CORE_PERMISSIONS,
  OWNER_ONLY_PERMISSIONS,
} from '@erxes/core-contract';
import { type Caller, type Db, orgUnits, tags } from '@erxes/core-db';
import { inArray } from 'drizzle-orm';
import { can } from '~/http/access';
import { fail } from '~/http/errors';
import { AREA_PERMISSIONS, kindOf } from '~/http/keyRules';
import { installedPlugin } from '../plugins/installedPlugin';

type Member = Extract<Caller, { type: 'user' }>;

export interface KeyRulesInput {
  kind: 'regular' | 'management';
  areas: ApiKeyAreas;
  pluginAccess: ApiKeyPlugins;
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
 * The actions the maker may do now in each plugin the key opens; refuses a plugin that isn't
 * installed or that the maker's role can't use. Plugin actions are named `<plugin>.…`.
 */
const pluginActionsOf = async (client: Db, me: Member, pluginAccess: ApiKeyPlugins) => {
  const names = Object.keys(pluginAccess);
  const installed = await Promise.all(names.map((name) => installedPlugin(client, name)));

  return names.flatMap((name, index) => {
    const plugin = installed[index];

    if (!plugin) throw invalid('pluginAccess', `${name} is not installed`);

    const actions = (plugin.manifest?.permissions ?? []).map((permission) => permission.action);
    const own = actions.filter((action) => can(me, action));

    if (actions.length && !own.length) {
      throw fail('BEYOND_OWN_PERMISSIONS', `You can't give ${name}: your role doesn't allow it`, {
        permissions: actions,
      });
    }

    return own;
  });
};

/**
 * Refuses rules the maker can't give: a management key from anyone but an owner or admin,
 * an area of the other kind, an area or plugin the maker's role lacks, limits on a management
 * key, plugins with contact limits, units or tags the organisation doesn't have.
 */
const checkKeyRules = async (client: Db, me: Member, input: KeyRulesInput) => {
  if (input.kind === 'management' && me.role !== 'owner' && me.role !== 'admin') {
    throw fail('OWNER_ONLY', 'Only an owner or admin can make a management key');
  }

  const opened = API_KEY_AREAS.filter((area) => input.areas[area]);
  const plugins = Object.keys(input.pluginAccess);

  if (!opened.length && !plugins.length) throw invalid('areas', 'Choose at least one area');

  if (plugins.length && input.kind !== 'regular') {
    throw invalid('pluginAccess', 'Only regular keys call plugins');
  }

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

  if (limited && plugins.length) {
    throw invalid(
      'pluginAccess',
      "Plugins don't follow contact limits: a limited key opens contacts and products only",
    );
  }

  if (await missing(client, orgUnits, input.unitIds)) throw invalid('unitIds', 'Unit not found');

  if (await missing(client, tags, input.tagIds)) throw invalid('tagIds', 'Tag not found');
};

/**
 * The columns the rules set, once the maker may give them: the maker's permissions as they
 * are now, with their actions in the plugins the key opens.
 */
export const keyRuleColumns = async (client: Db, me: Member, input: KeyRulesInput) => {
  await checkKeyRules(client, me, input);

  const pluginActions = await pluginActionsOf(client, me, input.pluginAccess);

  return {
    kind: input.kind,
    areas: input.areas,
    pluginAccess: input.pluginAccess,
    ownRecords: input.ownRecords,
    unitIds: [...new Set(input.unitIds)],
    tagIds: [...new Set(input.tagIds)],
    allowedIps: [...new Set(input.allowedIps)],
    permissions: [...new Set([...permissionsOf(me), ...pluginActions])],
  };
};
