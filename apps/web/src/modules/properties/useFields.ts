import type { PropertyContentType, Field, FieldGroup } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { orpc } from '@erxes/core-contract/client';

/** Field groups of a record type, in order (archived ones with `archived`). */
export const fieldGroupsQuery = (contentType: PropertyContentType, archived = false) =>
  orpc.fieldGroups.list.queryOptions({ input: { contentType, archived }, staleTime: 60_000 });

export const useFieldGroups = (
  contentType: PropertyContentType,
  { archived = false }: { archived?: boolean } = {},
) => {
  const query = useQuery(fieldGroupsQuery(contentType, archived));

  return { groups: query.data?.data ?? [], loading: query.isPending, error: query.error };
};

/** Every field of a record type, hidden ones too (archived ones with `archived`). */
export const useAllFields = (
  contentType: PropertyContentType,
  { archived = false }: { archived?: boolean } = {},
) => {
  const query = useQuery(
    orpc.fields.list.queryOptions({ input: { contentType, archived }, staleTime: 60_000 }),
  );

  return { fields: query.data?.data ?? [], loading: query.isPending, error: query.error };
};

/** Fields under one heading: a group, the ungrouped ones, or a plugin's (`plugin`, under its `title`). */
export type FieldSection = {
  group: FieldGroup | null;
  plugin: string | null;
  title: string | null;
  fields: Field[];
};

/**
 * Members' fields under their groups, groups in order, then those without a group
 * (`group: null`), then each plugin's fields under its title.
 */
export const groupFields = (groups: FieldGroup[], fields: Field[]): FieldSection[] => {
  const known = new Set(groups.map((group) => group.id));
  const own = fields.filter((field) => !field.plugin);

  const sections: FieldSection[] = groups.map((group) => ({
    group,
    plugin: null,
    title: group.name,
    fields: own.filter((field) => field.groupId === group.id),
  }));

  const ungrouped = own.filter((field) => !field.groupId || !known.has(field.groupId));

  const plugins = [...new Set(fields.flatMap((field) => field.plugin ?? []))].map(
    (plugin): FieldSection => {
      const inPlugin = fields.filter((field) => field.plugin === plugin);

      return { group: null, plugin, title: inPlugin[0]?.pluginTitle ?? plugin, fields: inPlugin };
    },
  );

  return [
    ...sections,
    ...(ungrouped.length ? [{ group: null, plugin: null, title: null, fields: ungrouped }] : []),
    ...plugins,
  ];
};

/**
 * The organisation's visible custom fields of a record type, ordered by group
 * then by field, with their groups (`sections`).
 */
export const useFields = (contentType: PropertyContentType) => {
  const all = useAllFields(contentType);
  const { groups, loading: groupsLoading, error: groupsError } = useFieldGroups(contentType);

  const sections = useMemo(
    () =>
      groupFields(
        groups,
        all.fields.filter((field) => field.isVisible),
      ).filter((section) => section.fields.length > 0),
    [groups, all.fields],
  );

  const fields = useMemo(() => sections.flatMap((section) => section.fields), [sections]);

  return {
    fields,
    sections,
    groups,
    loading: all.loading || groupsLoading,
    error: all.error ?? groupsError,
  };
};
