import {
  API_KEY_AREA_INFO,
  API_KEY_DATA_AREAS,
  API_KEY_SETUP_AREAS,
  type API_KEY_LIFETIMES,
  type ApiKey,
  type ApiKeyAccess,
  type ApiKeyArea,
  type ApiKeyAreas,
} from '@erxes/core-contract';

export type KeyKind = 'regular' | 'management';

export type Preset = 'read' | 'write' | 'custom';

/** Which contacts a regular key sees. */
export type ContactScope = 'all' | 'own' | 'units';

export type Lifetime = (typeof API_KEY_LIFETIMES)[number] | null;

/** What the form holds; `keyRules` turns it into the API's input. */
export interface KeyDraft {
  name: string;
  kind: KeyKind;
  preset: Preset;
  areas: ApiKeyAreas;
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

/** The areas a preset opens: each of the kind's, as far as the member may give it. */
export const presetAreas = (
  kind: KeyKind,
  preset: 'read' | 'write',
  can: (a: string) => boolean,
) => {
  const areas: ApiKeyAreas = {};

  for (const area of areasOf(kind)) {
    if (preset === 'write' && canGive(area, 'write', can)) areas[area] = 'write';
    else if (canGive(area, 'read', can)) areas[area] = 'read';
  }

  return areas;
};

export const newDraft = (can: (action: string) => boolean): KeyDraft => ({
  name: '',
  kind: 'regular',
  preset: 'read',
  areas: presetAreas('regular', 'read', can),
  scope: 'all',
  unitIds: [],
  tagIds: [],
  ips: [],
  lifetime: 90,
});

const sameAreas = (kind: KeyKind, left: ApiKeyAreas, right: ApiKeyAreas) =>
  areasOf(kind).every((area) => left[area] === right[area]);

/** The preset whose areas, within the draft's limits, the key has; or custom. */
const presetOf = (draft: KeyDraft, can: (action: string) => boolean): Preset =>
  (['read', 'write'] as const).find((preset) => {
    const opened = fitLimits({ ...draft, areas: presetAreas(draft.kind, preset, can) }).areas;

    return sameAreas(draft.kind, draft.areas, opened);
  }) ?? 'custom';

/** The form for a key that exists; a key made before rules starts from "read only". */
export const draftOf = (key: ApiKey, can: (action: string) => boolean): KeyDraft => {
  if (key.kind === 'member') return { ...newDraft(can), name: key.name, lifetime: 'keep' };

  const draft: KeyDraft = {
    name: key.name,
    kind: key.kind,
    preset: 'custom',
    areas: key.areas,
    scope: key.ownRecords ? 'own' : key.unitIds.length ? 'units' : 'all',
    unitIds: key.unitIds,
    tagIds: key.tagIds,
    ips: key.allowedIps,
    lifetime: 'keep',
  };

  return { ...draft, preset: presetOf(draft, can) };
};

/** Does the key see only some contacts? */
export const isLimited = (draft: KeyDraft) =>
  draft.kind === 'regular' && (draft.scope !== 'all' || draft.tagIds.length > 0);

/** Can the area be opened with the draft's contact limits? */
export const fitsLimits = (draft: KeyDraft, area: ApiKeyArea) =>
  !isLimited(draft) || !('outsideContactLimits' in API_KEY_AREA_INFO[area]);

/** The draft with the areas its contact limits rule out closed. */
export const fitLimits = (draft: KeyDraft): KeyDraft => {
  const areas: ApiKeyAreas = {};

  for (const area of areasOf(draft.kind)) {
    if (fitsLimits(draft, area)) areas[area] = draft.areas[area];
  }

  return { ...draft, areas };
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
    ownRecords: regular && draft.scope === 'own',
    unitIds: regular && draft.scope === 'units' ? draft.unitIds : [],
    tagIds: regular ? draft.tagIds : [],
    allowedIps: draft.ips,
  };
};

export const opensAny = (draft: KeyDraft) => areasOf(draft.kind).some((area) => draft.areas[area]);
