import {
  API_KEY_AREA_INFO,
  API_KEY_AREAS,
  API_KEY_DATA_AREAS,
  API_KEY_SETUP_AREAS,
  type API_KEY_LIFETIMES,
  type ApiKey,
  type ApiKeyAccess,
  type ApiKeyActions,
  type ApiKeyArea,
  type ApiKeyAreas,
  type ApiKeyPlugins,
} from '@erxes/core-contract';

export type KeyKind = 'regular' | 'management';

export type Preset = 'read' | 'write' | 'custom';

/** Which contacts a regular key sees. */
export type ContactScope = 'all' | 'own' | 'units';

export type Lifetime = (typeof API_KEY_LIFETIMES)[number] | null;

/** What the member may give a key: their permissions, and the installed plugins they use. */
export interface Giver {
  can: (action: string) => boolean;
  plugins: readonly string[];
}

/** What the form holds; `keyRules` turns it into the API's input. */
export interface KeyDraft {
  name: string;
  kind: KeyKind;
  preset: Preset;
  areas: ApiKeyAreas;
  /** Regular keys: the plugins whose APIs it may call. */
  plugins: ApiKeyPlugins;
  /** Where it uses only some actions, by area or plugin name. */
  actions: ApiKeyActions;
  scope: ContactScope;
  unitIds: string[];
  tagIds: string[];
  ips: string[];
  /** `keep`: an existing key keeps its expiry. */
  lifetime: Lifetime | 'keep';
}

export const areasOf = (kind: KeyKind): readonly ApiKeyArea[] =>
  kind === 'regular' ? API_KEY_DATA_AREAS : API_KEY_SETUP_AREAS;

const AREAS = new Set<string>(API_KEY_AREAS);

const isArea = (name: string): name is ApiKeyArea => AREAS.has(name);

/** May the member give the area: everything its reading needs, and for writing one of its writes. */
export const canGive = (
  area: ApiKeyArea,
  access: ApiKeyAccess,
  can: (action: string) => boolean,
) => {
  const info = API_KEY_AREA_INFO[area];

  if (access === 'write' && 'readOnly' in info) return false;

  const reads = info.read.every((permission: string) => can(permission));
  const writes = !info.write.length || info.write.some((permission: string) => can(permission));

  return access === 'read' ? reads : reads && writes;
};

/** The listed actions the draft has ticked in an area or plugin. */
export const tickedIn = (draft: KeyDraft, name: string, choices: readonly string[]) =>
  choices.filter((action) => draft.actions[name]?.includes(action));

/** An area or plugin set to a level, its chosen actions dropped. */
export const setAccess = (draft: KeyDraft, name: string, access: ApiKeyAccess | undefined) => {
  const { [name]: _actions, ...actions } = draft.actions;

  if (isArea(name)) return { ...draft, actions, areas: { ...draft.areas, [name]: access } };

  const { [name]: _plugin, ...plugins } = draft.plugins;

  return { ...draft, actions, plugins: access ? { ...plugins, [name]: access } : plugins };
};

/**
 * An area with only the ticked calls, or a plugin with only the ticked actions. The area opens
 * for writing when `writes`, the plugin always; with nothing ticked it stays closed.
 */
export const chooseActions = (
  draft: KeyDraft,
  name: string,
  ticked: readonly string[],
  writes: boolean,
): KeyDraft => {
  const closed = setAccess(draft, name, undefined);
  const actions = { ...closed.actions, [name]: [...ticked] };

  if (!isArea(name)) {
    const plugins = ticked.length
      ? { ...closed.plugins, [name]: 'write' as const }
      : closed.plugins;

    return { ...closed, actions, plugins };
  }

  const access = ticked.length ? (writes ? 'write' : 'read') : undefined;

  return { ...closed, actions, areas: { ...closed.areas, [name]: access } };
};

/**
 * What a preset opens: each of the kind's areas, as far as the member may give it, and for a
 * regular key each plugin the member uses; no chosen actions.
 */
export const presetAccess = (kind: KeyKind, preset: 'read' | 'write', giver: Giver) => {
  const areas: ApiKeyAreas = {};

  for (const area of areasOf(kind)) {
    if (preset === 'write' && canGive(area, 'write', giver.can)) areas[area] = 'write';
    else if (canGive(area, 'read', giver.can)) areas[area] = 'read';
  }

  const plugins: ApiKeyPlugins =
    kind === 'regular' ? Object.fromEntries(giver.plugins.map((name) => [name, preset])) : {};

  return { areas, plugins, actions: {} };
};

export const newDraft = (giver: Giver): KeyDraft => ({
  name: '',
  kind: 'regular',
  preset: 'read',
  ...presetAccess('regular', 'read', giver),
  scope: 'all',
  unitIds: [],
  tagIds: [],
  ips: [],
  lifetime: 90,
});

const sameAccess = <K extends string>(
  keys: readonly K[],
  left: Partial<Record<K, ApiKeyAccess>>,
  right: Partial<Record<K, ApiKeyAccess>>,
) => keys.every((key) => left[key] === right[key]);

/** The preset whose areas and plugins, within the draft's limits, the key has; or custom. */
const presetOf = (draft: KeyDraft, giver: Giver): Preset => {
  if (Object.keys(draft.actions).length) return 'custom';

  return (
    (['read', 'write'] as const).find((preset) => {
      const opened = fitLimits({ ...draft, ...presetAccess(draft.kind, preset, giver) });
      const plugins = [...new Set([...Object.keys(draft.plugins), ...giver.plugins])];

      return (
        sameAccess(areasOf(draft.kind), draft.areas, opened.areas) &&
        sameAccess(plugins, draft.plugins, opened.plugins)
      );
    }) ?? 'custom'
  );
};

/** The form for a key that exists; a key made before rules starts from "read only". */
export const draftOf = (key: ApiKey, giver: Giver): KeyDraft => {
  if (key.kind === 'member') return { ...newDraft(giver), name: key.name, lifetime: 'keep' };

  const draft: KeyDraft = {
    name: key.name,
    kind: key.kind,
    preset: 'custom',
    areas: key.areas,
    plugins: key.pluginAccess,
    actions: key.actions,
    scope: key.ownRecords ? 'own' : key.unitIds.length ? 'units' : 'all',
    unitIds: key.unitIds,
    tagIds: key.tagIds,
    ips: key.allowedIps,
    lifetime: 'keep',
  };

  return { ...draft, preset: presetOf(draft, giver) };
};

/** The chosen actions of the areas and plugins the key may still open. */
const actionsIn = (actions: ApiKeyActions, keep: (name: string) => boolean) =>
  Object.fromEntries(Object.entries(actions).filter(([name]) => keep(name)));

/** Does the key see only some contacts? */
export const isLimited = (draft: KeyDraft) =>
  draft.kind === 'regular' && (draft.scope !== 'all' || draft.tagIds.length > 0);

/** Can the area be opened with the draft's contact limits? */
export const fitsLimits = (draft: KeyDraft, area: ApiKeyArea) =>
  !isLimited(draft) || !('outsideContactLimits' in API_KEY_AREA_INFO[area]);

/**
 * The draft with what its contact limits rule out closed: areas outside them, and plugins,
 * which keep their own records.
 */
export const fitLimits = (draft: KeyDraft): KeyDraft => {
  const areas: ApiKeyAreas = {};

  for (const area of areasOf(draft.kind)) {
    if (fitsLimits(draft, area)) areas[area] = draft.areas[area];
  }

  const pluginsOpen = draft.kind === 'regular' && !isLimited(draft);
  const plugins = pluginsOpen ? draft.plugins : {};

  const actions = actionsIn(draft.actions, (name) =>
    isArea(name) ? areasOf(draft.kind).includes(name) && fitsLimits(draft, name) : pluginsOpen,
  );

  return { ...draft, areas, plugins, actions };
};

/** The rules the API takes. */
export const keyRules = (draft: KeyDraft) => {
  const regular = draft.kind === 'regular';
  const areas: ApiKeyAreas = {};

  for (const area of areasOf(draft.kind)) {
    const access = draft.areas[area];

    if (access) areas[area] = access;
  }

  const plugins = regular ? draft.plugins : {};

  const actions = actionsIn(
    draft.actions,
    (name) =>
      Boolean(draft.actions[name]?.length) &&
      (isArea(name) ? Boolean(areas[name]) : Object.hasOwn(plugins, name)),
  );

  return {
    name: draft.name.trim(),
    kind: draft.kind,
    areas,
    pluginAccess: plugins,
    actions,
    ownRecords: regular && draft.scope === 'own',
    unitIds: regular && draft.scope === 'units' ? draft.unitIds : [],
    tagIds: regular ? draft.tagIds : [],
    allowedIps: draft.ips,
  };
};

export const opensAny = (draft: KeyDraft) =>
  areasOf(draft.kind).some((area) => draft.areas[area]) || Object.keys(draft.plugins).length > 0;
