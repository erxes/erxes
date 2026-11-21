import {
  API_KEY_AREA_INFO,
  API_KEY_AREAS,
  API_KEY_DATA_AREAS,
  coreContract,
  type ApiKeyAccess,
  type ApiKeyActions,
  type ApiKeyArea,
  type ApiKeyAreas,
  type CorePermission,
} from '@erxes/core-contract';
import type { KeyRules } from '@erxes/core-db';
import { getContractRouter, isContractProcedure } from '@orpc/contract';
import { ACCESS } from './policies';
import type { ProcedurePath } from './policyRules';

type Group = keyof typeof coreContract;

/**
 * Where a group's procedures sit for keys: an area (GET reads it, anything else writes it),
 * `lookup` (lists any key reads; changing them writes `writes`), or null (no key calls it).
 */
type GroupRule = ApiKeyArea | { lookup: true; writes: ApiKeyArea } | null;

const GROUP_RULES: Record<Group, GroupRule> = {
  activities: 'contacts',
  agents: null,
  assistant: null,
  apiKeys: 'keys',
  automations: 'automations',
  // Entries name customers, and streams send the log out.
  audit: null,
  auth: null,
  // Broadcasts and the suppression list send to and name contacts' addresses.
  broadcasts: null,
  broadcastSchedules: null,
  suppressions: null,
  companies: 'contacts',
  customers: 'contacts',
  favorites: null,
  customerAccount: null,
  customerAuth: null,
  customerNotifications: null,
  emails: null,
  // The event stream carries contacts' data.
  events: null,
  fieldGroups: { lookup: true, writes: 'settings' },
  fields: { lookup: true, writes: 'settings' },
  files: 'files',
  integrationAccounts: null,
  integrations: null,
  pluginAccounts: null,
  pluginSecrets: null,
  leads: 'contacts',
  notifications: null,
  organizations: { lookup: true, writes: 'settings' },
  payments: 'payments',
  ebarimt: 'payments',
  plugins: 'plugins',
  productCategories: 'products',
  products: 'products',
  roles: 'team',
  saas: 'settings',
  search: { lookup: true, writes: 'settings' },
  tags: { lookup: true, writes: 'settings' },
  units: { lookup: true, writes: 'team' },
  unitTypes: { lookup: true, writes: 'team' },
  // Deleted records are stored whole, outside the rows a key's limits hide.
  trash: null,
  // Imports and exports run later as the member, without the key's limits.
  transfer: null,
  users: 'team',
  views: null,
  webhooks: 'webhooks',
};

const GROUPS = new Map<string, GroupRule>(Object.entries(GROUP_RULES));

/** Procedures that sit elsewhere than their group, or that no key calls (null). */
const PROCEDURE_RULES: Partial<Record<ProcedurePath, ApiKeyArea | null>> = {
  'activities.byMember': null,
  'apiKeys.create': null,
  'apiKeys.update': null,
  'apiKeys.calls': null,
  'apiKeys.try': null,
  // Automations run as the member who turns them on, without the key's limits.
  'automations.activate': null,
  'automations.start': null,
  'automations.restoreVersion': null,
  'automations.retryRun': null,
  'automations.create': null,
  'automations.update': null,
  'automations.pause': null,
  'automations.remove': null,
  'automations.cancelRun': null,
  'automations.test': null,
  'files.settings': 'settings',
  'files.updateSettings': 'settings',
  // Storage keys are entered by a member, never sent by a key.
  'files.saveBucket': null,
  'files.removeBucket': null,
  'leads.createStage': 'settings',
  'leads.updateStage': 'settings',
  'leads.reorderStages': 'settings',
  'leads.removeStage': 'settings',
  'payments.gateways': 'settings',
  'payments.addGateway': 'settings',
  'payments.updateGateway': 'settings',
  'payments.removeGateway': 'settings',
  'payments.pluginSettings': 'settings',
  'payments.updatePluginSettings': 'settings',
  'payments.payTestInvoice': 'settings',
  'ebarimt.settings': 'settings',
  'ebarimt.plugins': 'settings',
  'ebarimt.saveSettings': 'settings',
  'ebarimt.removeSettings': 'settings',
  'ebarimt.testConnection': 'settings',
  'ebarimt.printTemplates': 'settings',
  'ebarimt.savePrintTemplate': 'settings',
  'ebarimt.resetPrintTemplate': 'settings',
  'ebarimt.previewPrint': 'settings',
  'users.setPassword': null,
  'users.update': null,
  // Webhooks carry the events' data: where they send it and what is a signed-in member's call.
  'webhooks.create': null,
  'webhooks.update': null,
  'webhooks.deliveries': null,
  'webhooks.redeliver': null,
};

const PROCEDURES = new Map<string, ApiKeyArea | null>(Object.entries(PROCEDURE_RULES));

/** The permissions each area brings (`API_KEY_AREA_INFO`), checked to be core's. */
export const AREA_PERMISSIONS: Record<
  ApiKeyArea,
  Record<ApiKeyAccess, readonly CorePermission[]>
> = API_KEY_AREA_INFO;

const POLICIES = new Map(Object.entries(ACCESS));

/** The permission a member needs for the call; null when any member may make it. */
export const callPermission = (path: string): string | null => {
  const policy = POLICIES.get(path);

  return policy && 'member' in policy && policy.member && policy.member !== 'any'
    ? policy.member
    : null;
};

/** The permissions the areas open: what their chosen calls need, or all their access brings. */
export const areaPermissions = (areas: ApiKeyAreas, actions: ApiKeyActions) =>
  API_KEY_AREAS.flatMap((area): readonly string[] => {
    const chosen = actions[area];

    if (chosen) return chosen.map(callPermission).filter((permission) => permission !== null);

    const perms = AREA_PERMISSIONS[area];

    if (areas[area] === 'write') return [...perms.read, ...perms.write];

    return areas[area] === 'read' ? perms.read : [];
  });

export type KeyKind = KeyRules['kind'];

/** Which kind of key opens the area. */
const DATA_AREAS = new Set<string>(API_KEY_DATA_AREAS);

export const kindOf = (area: ApiKeyArea): KeyKind =>
  DATA_AREAS.has(area) ? 'regular' : 'management';

/** What a key may do with a procedure, or null when no key calls it. */
export interface KeyNeed {
  area: ApiKeyArea | 'lookup';
  access: ApiKeyAccess;
}

const methodOf = (path: string) => {
  const procedure = getContractRouter(coreContract, path.split('.'));

  return isContractProcedure(procedure) ? (procedure['~orpc'].route.method ?? 'POST') : null;
};

/** The area and access a procedure needs from a key; null when keys never call it. */
export const keyNeed = (path: string): KeyNeed | null => {
  const method = methodOf(path);

  if (!method) return null;

  const access: ApiKeyAccess = method === 'GET' ? 'read' : 'write';
  const override = PROCEDURES.get(path);

  if (override !== undefined) return override && { area: override, access };

  const rule = GROUPS.get(path.split('.')[0] ?? '');

  if (!rule) return null;

  if (typeof rule === 'string') return { area: rule, access };

  return access === 'read' ? { area: 'lookup', access } : { area: rule.writes, access };
};

const NEEDS = [...POLICIES.keys()].map((path) => ({ path, need: keyNeed(path) }));

/** The calls a key may make in the area with the access. */
export const areaCalls = (area: ApiKeyArea, access: ApiKeyAccess) =>
  NEEDS.filter(({ need }) => need?.area === area && need.access === access).map(({ path }) => path);

export interface KeyDecision {
  allowed: boolean;
  /** The rule that decided, as the audit log and "Try this key" show it. */
  rule: string;
  reason: string;
}

const isLimited = (rows: KeyRules['rows']) => rows.owners !== null || rows.tags !== null;

/**
 * May the key take a token for a plugin's API (`plugins.session`)? A regular key without
 * contact limits, for a plugin it opens; without `plugin`, for any. Plugins keep their own
 * records, outside the rows a key's limits hide.
 */
export const decidePluginKey = (
  key: Pick<KeyRules, 'kind' | 'plugins' | 'rows'>,
  plugin?: string,
): KeyDecision => {
  if (key.kind !== 'regular') {
    return {
      allowed: false,
      rule: `kind:${key.kind}`,
      reason: 'Management keys work with setup; plugins are data',
    };
  }

  if (isLimited(key.rows)) {
    return {
      allowed: false,
      rule: 'rows:plugins',
      reason: "Plugins don't follow this key's contact limits, so it can't open them",
    };
  }

  if (plugin === undefined) {
    return Object.keys(key.plugins).length
      ? { allowed: true, rule: 'plugins', reason: 'This key calls the plugins it opens' }
      : { allowed: false, rule: 'plugins', reason: "This key doesn't open any plugin" };
  }

  const access = key.plugins[plugin];

  if (!access) {
    return { allowed: false, rule: `plugin:${plugin}`, reason: `This key doesn't open ${plugin}` };
  }

  return {
    allowed: true,
    rule: `plugin:${plugin}:${access}`,
    reason: access === 'write' ? `This key reads and writes ${plugin}` : `This key reads ${plugin}`,
  };
};

/**
 * May a regular or management key call the procedure? Deny by default: the procedure must
 * be one keys call, in an area of the key's kind that the key opens, with the access it gives.
 * Which records it then sees is row level security's (`RowLimits`); which permissions it
 * holds is `permissions`'.
 */
export const decideKey = (
  key: Pick<KeyRules, 'kind' | 'areas' | 'plugins' | 'actions' | 'rows'>,
  path: string,
): KeyDecision => {
  if (path === 'plugins.session') return decidePluginKey(key);

  const need = keyNeed(path);

  if (!need) {
    return { allowed: false, rule: 'never', reason: 'API keys cannot call this' };
  }

  if (need.area === 'lookup') {
    return { allowed: true, rule: 'lookup', reason: 'Every key reads lists like tags and units' };
  }

  const { label } = API_KEY_AREA_INFO[need.area];

  if (kindOf(need.area) !== key.kind) {
    return {
      allowed: false,
      rule: `kind:${key.kind}`,
      reason:
        key.kind === 'regular'
          ? `Regular keys work with data; ${label} is setup`
          : `Management keys work with setup; ${label} is data`,
    };
  }

  const granted = key.areas[need.area];

  if (!granted) {
    return { allowed: false, rule: `area:${need.area}`, reason: `This key doesn't open ${label}` };
  }

  if (isLimited(key.rows) && 'outsideContactLimits' in API_KEY_AREA_INFO[need.area]) {
    return {
      allowed: false,
      rule: `rows:${need.area}`,
      reason: `${label} don't follow this key's contact limits, so it can't open them`,
    };
  }

  if (need.access === 'write' && granted === 'read') {
    return {
      allowed: false,
      rule: `area:${need.area}:read`,
      reason: `This key only reads ${label}`,
    };
  }

  const chosen = key.actions[need.area];

  if (chosen && !chosen.includes(path)) {
    return { allowed: false, rule: `call:${path}`, reason: `This key wasn't given ${path}` };
  }

  return {
    allowed: true,
    rule: `area:${need.area}:${granted}`,
    reason: granted === 'write' ? `This key reads and writes ${label}` : `This key reads ${label}`,
  };
};
