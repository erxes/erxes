import {
  API_KEY_AREA_INFO,
  API_KEY_DATA_AREAS,
  API_KEY_SETUP_AREAS,
  type API_KEY_LIFETIMES,
  type ApiKey,
  type ApiKeyAccess,
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
  scope: ContactScope;
  unitIds: string[];
  tagIds: string[];
  ips: string[];
  /** `keep`: an existing key keeps its expiry. */
  lifetime: Lifetime | 'keep';
}

export const areasOf = (kind: KeyKind): readonly ApiKeyArea[] =>
  kind === 'regular' ? API_KEY_DATA_AREAS : API_KEY_SETUP_AREAS;

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

/**
 * What a preset opens: each of the kind's areas, as far as the member may give it, and for a
 * regular key each plugin the member uses.
 */
export const presetAccess = (kind: KeyKind, preset: 'read' | 'write', giver: Giver) => {
  const areas: ApiKeyAreas = {};

  for (const area of areasOf(kind)) {
    if (preset === 'write' && canGive(area, 'write', giver.can)) areas[area] = 'write';
    else if (canGive(area, 'read', giver.can)) areas[area] = 'read';
  }

  const plugins: ApiKeyPlugins =
    kind === 'regular' ? Object.fromEntries(giver.plugins.map((name) => [name, preset])) : {};

  return { areas, plugins };
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
const presetOf = (draft: KeyDraft, giver: Giver): Preset =>
  (['read', 'write'] as const).find((preset) => {
    const opened = fitLimits({ ...draft, ...presetAccess(draft.kind, preset, giver) });
    const plugins = [...new Set([...Object.keys(draft.plugins), ...giver.plugins])];

    return (
      sameAccess(areasOf(draft.kind), draft.areas, opened.areas) &&
      sameAccess(plugins, draft.plugins, opened.plugins)
    );
  }) ?? 'custom';

/** The form for a key that exists; a key made before rules starts from "read only". */
export const draftOf = (key: ApiKey, giver: Giver): KeyDraft => {
  if (key.kind === 'member') return { ...newDraft(giver), name: key.name, lifetime: 'keep' };

  const draft: KeyDraft = {
    name: key.name,
    kind: key.kind,
    preset: 'custom',
    areas: key.areas,
    plugins: key.pluginAccess,
    scope: key.ownRecords ? 'own' : key.unitIds.length ? 'units' : 'all',
    unitIds: key.unitIds,
    tagIds: key.tagIds,
    ips: key.allowedIps,
    lifetime: 'keep',
  };

  return { ...draft, preset: presetOf(draft, giver) };
};

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

  const plugins = draft.kind === 'regular' && !isLimited(draft) ? draft.plugins : {};

  return { ...draft, areas, plugins };
};

/** The rules the API takes. */
export const keyRules = (draft: KeyDraft) => {
  const regular = draft.kind === 'regular';
  const areas: ApiKeyAreas = {};

  for (const area of areasOf(draft.kind)) {
    const access = draft.areas[area];

    if (access) areas[area] = access;
  }

  return {
    name: draft.name.trim(),
    kind: draft.kind,
    areas,
    pluginAccess: regular ? draft.plugins : {},
    ownRecords: regular && draft.scope === 'own',
    unitIds: regular && draft.scope === 'units' ? draft.unitIds : [],
    tagIds: regular ? draft.tagIds : [],
    allowedIps: draft.ips,
  };
};

export const opensAny = (draft: KeyDraft) =>
  areasOf(draft.kind).some((area) => draft.areas[area]) || Object.keys(draft.plugins).length > 0;
