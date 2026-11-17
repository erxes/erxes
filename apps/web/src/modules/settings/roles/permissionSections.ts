import type { PermissionInfo, PermissionSet } from '@erxes/core-contract';

/** One area inside a source (`Contacts`, `Tickets`) and its permissions. */
export type PermissionGroup = { name: string; permissions: PermissionInfo[] };

/** Core or one plugin: its ready-made sets and its permissions by area. */
export type PermissionSection = {
  source: string;
  title: string;
  sets: PermissionSet[];
  groups: PermissionGroup[];
  /** Every action in the section, for its counts and its select-all box. */
  actions: string[];
};

export type GrantFilter = 'all' | 'granted' | 'not-granted';

const matches = (permission: PermissionInfo, words: string[]) => {
  const text =
    `${permission.label} ${permission.action} ${permission.group} ${permission.description ?? ''}`.toLowerCase();

  return words.every((word) => text.includes(word));
};

const keeps = (filter: GrantFilter, granted: Set<string>, action: string) =>
  filter === 'all' || (filter === 'granted') === granted.has(action);

/**
 * The catalog by source, core first and then the plugins by title, each by area in the
 * catalog's order. `titleOf` names a plugin; one without a title shows its key.
 */
export const sectionsOf = (
  catalog: PermissionInfo[],
  sets: PermissionSet[],
  titleOf: (source: string) => string,
): PermissionSection[] => {
  const bySource = new Map<string, Map<string, PermissionInfo[]>>();

  for (const permission of catalog) {
    const groups = bySource.get(permission.source) ?? new Map<string, PermissionInfo[]>();

    groups.set(permission.group, [...(groups.get(permission.group) ?? []), permission]);
    bySource.set(permission.source, groups);
  }

  const sections = [...bySource.entries()].map(([source, groups]) => ({
    source,
    title: titleOf(source),
    sets: sets.filter((set) => set.source === source),
    groups: [...groups.entries()].map(([name, permissions]) => ({ name, permissions })),
    actions: [...groups.values()].flat().map((permission) => permission.action),
  }));

  return sections.toSorted((a, b) =>
    a.source === 'core' ? -1 : b.source === 'core' ? 1 : a.title.localeCompare(b.title),
  );
};

/**
 * The sections cut to what the search and the filter keep: a section or an area with
 * nothing left drops out, and a search that names the section's title keeps all of it.
 */
export const filterSections = (
  sections: PermissionSection[],
  query: string,
  filter: GrantFilter,
  granted: Set<string>,
): PermissionSection[] => {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  return sections.flatMap((section) => {
    const titled = words.every((word) => section.title.toLowerCase().includes(word));

    const groups = section.groups.flatMap((group) => {
      const permissions = group.permissions.filter(
        (permission) =>
          (titled || matches(permission, words)) && keeps(filter, granted, permission.action),
      );

      return permissions.length ? [{ ...group, permissions }] : [];
    });

    const sets = filter === 'all' && (titled || !words.length) ? section.sets : [];

    return groups.length || sets.length ? [{ ...section, groups, sets }] : [];
  });
};

/** How many of the actions the role has. */
export const countGranted = (actions: string[], granted: Set<string>) =>
  actions.filter((action) => granted.has(action)).length;
