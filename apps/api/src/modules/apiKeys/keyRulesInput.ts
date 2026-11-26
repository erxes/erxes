import {
  API_KEY_AREA_INFO,
  API_KEY_AREAS,
  type ApiKeyAccess,
  type ApiKeyActions,
  type ApiKeyArea,
  type ApiKeyAreas,
  type ApiKeyRules,
  type ApiKeyPlugins,
  CORE_PERMISSIONS,
  OWNER_ONLY_PERMISSIONS,
} from '@erxes/core-contract';
import { type Caller, type Db, orgUnits, tags } from '@erxes/core-db';
import { inArray } from 'drizzle-orm';
import { can } from '~/http/access';
import { fail } from '~/http/errors';
import { AREA_PERMISSIONS, areaCalls, callPermission, kindOf } from '~/http/keyRules';
import { installedPlugin } from '../plugins/installedPlugin';

type Member = Extract<Caller, { type: 'user' }>;

export type KeyRulesInput = Omit<ApiKeyRules, 'name' | 'lifetimeDays'>;

const invalid = (field: string, message: string) =>
  fail('INVALID_INPUT', message, { issues: [{ path: [field], message }] });

export const mustOpenSomething = ({
  areas,
  pluginAccess,
}: Pick<ApiKeyRules, 'areas' | 'pluginAccess'>) => {
  if (!API_KEY_AREAS.some((area) => areas[area]) && !Object.keys(pluginAccess).length) {
    throw invalid('areas', 'Choose at least one area');
  }
};

const OWNER_ONLY = new Set(OWNER_ONLY_PERMISSIONS);

/** What the member may do now, spelled out: a key keeps this list, not a role or `*`. */
const permissionsOf = (member: Member) => {
  const core = CORE_PERMISSIONS.map((permission) => permission.action).filter((action) =>
    can(member, action),
  );

  const own = member.permissions.filter((action) => action !== '*' && !OWNER_ONLY.has(action));

  return [...new Set([...core, ...own])];
};

const missing = async (client: Db, table: typeof tags | typeof orgUnits, ids: string[]) => {
  if (!ids.length) return false;

  const rows = await client.select({ id: table.id }).from(table).where(inArray(table.id, ids));

  return rows.length < new Set(ids).size;
};

const AREAS = new Set<string>(API_KEY_AREAS);

const isArea = (name: string): name is ApiKeyArea => AREAS.has(name);

const beyond = (label: string, permissions: readonly string[]) =>
  fail('BEYOND_OWN_PERMISSIONS', `You can't give ${label}: your role doesn't allow it`, {
    permissions: [...permissions],
  });

/**
 * An area's chosen calls, checked to be calls a key makes there. Opens the area for writing
 * when one of them writes; null when they are all the calls its access brings.
 */
const chooseAreaCalls = (area: ApiKeyArea, chosen: readonly string[]) => {
  const read = areaCalls(area, 'read');
  const write = areaCalls(area, 'write');
  const calls = [...new Set(chosen)];
  const unknown = calls.find((call) => !read.includes(call) && !write.includes(call));

  if (unknown) throw invalid('actions', `${API_KEY_AREA_INFO[area].label} has no call ${unknown}`);

  const access: ApiKeyAccess = calls.some((call) => write.includes(call)) ? 'write' : 'read';
  const all = access === 'write' ? read.length + write.length : read.length;

  return { access, actions: calls.length === all ? null : calls };
};

/**
 * The rules with each chosen area opened as its actions need, its chosen actions kept only
 * where they leave something out (\`areaActions\`), and each chosen plugin opened to write.
 */
const withChosenAreas = (input: KeyRulesInput) => {
  const areas: ApiKeyAreas = { ...input.areas };
  const pluginAccess: ApiKeyPlugins = { ...input.pluginAccess };
  const areaActions: ApiKeyActions = {};

  for (const [name, chosen] of Object.entries(input.actions)) {
    if (isArea(name)) {
      const area = chooseAreaCalls(name, chosen);

      areas[name] = area.access;

      if (area.actions) areaActions[name] = area.actions;
    } else {
      pluginAccess[name] = 'write';
    }
  }

  return { ...input, areas, pluginAccess, areaActions };
};

/**
 * The actions the maker may do now in each plugin the key opens, and the plugins' chosen
 * actions where they leave some out; refuses a plugin that isn't installed, one the maker's
 * role can't use, and a chosen action that isn't the plugin's or the maker's. Plugin actions
 * are named `<plugin>.…`.
 */
const pluginActionsOf = async (client: Db, me: Member, input: KeyRulesInput) => {
  const names = Object.keys(input.pluginAccess);
  const installed = await Promise.all(names.map((name) => installedPlugin(client, name)));
  const actions: ApiKeyActions = {};

  const own = names.flatMap((name, index) => {
    const plugin = installed[index];

    if (!plugin) throw invalid('pluginAccess', `${name} is not installed`);

    const all = (plugin.manifest?.permissions ?? []).map((permission) => permission.action);
    const mine = all.filter((action) => can(me, action));
    const given = input.actions[name];
    const chosen = given && [...new Set(given)];

    if (all.length && !mine.length) throw beyond(name, all);

    if (!chosen) return mine;

    const unknown = chosen.find((action) => !all.includes(action));

    if (unknown) throw invalid('actions', `${name} has no action ${unknown}`);

    if (!chosen.every((action) => mine.includes(action))) throw beyond(name, chosen);

    if (chosen.length < all.length) actions[name] = chosen;

    return chosen;
  });

  return { own, actions };
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
    const chosen = input.actions[area];
    const lacksWrite = access === 'write' && write.length > 0 && !write.some((p) => can(me, p));

    if (access === 'write' && 'readOnly' in API_KEY_AREA_INFO[area]) {
      throw invalid('areas', `Keys only read ${label}`);
    }

    const needs = (chosen ?? []).map(callPermission).filter((permission) => permission !== null);

    if (!needs.every((permission) => can(me, permission))) throw beyond(label, needs);

    if (!chosen && (!read.every((permission) => can(me, permission)) || lacksWrite)) {
      throw beyond(label, [...read, ...(access === 'write' ? write : [])]);
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
export const keyRuleColumns = async (client: Db, me: Member, given: KeyRulesInput) => {
  const input = withChosenAreas(given);

  await checkKeyRules(client, me, input);

  const plugins = await pluginActionsOf(client, me, input);

  return {
    kind: input.kind,
    areas: input.areas,
    pluginAccess: input.pluginAccess,
    actions: { ...input.areaActions, ...plugins.actions },
    ownRecords: input.ownRecords,
    unitIds: [...new Set(input.unitIds)],
    tagIds: [...new Set(input.tagIds)],
    allowedIps: [...new Set(input.allowedIps)],
    permissions: [...new Set([...permissionsOf(me), ...plugins.own])],
  };
};
