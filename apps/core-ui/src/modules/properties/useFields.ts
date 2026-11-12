import type { ContentType, Field, FieldGroup } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { orpc } from '~/lib/api';

/** Field groups of a record type, in order (archived ones with `archived`). */
export const fieldGroupsQuery = (contentType: ContentType, archived = false) =>
  orpc.fieldGroups.list.queryOptions({ input: { contentType, archived }, staleTime: 60_000 });

export const useFieldGroups = (
  contentType: ContentType,
  { archived = false }: { archived?: boolean } = {},
) => {
  const query = useQuery(fieldGroupsQuery(contentType, archived));

  return { groups: query.data?.data ?? [], loading: query.isPending, error: query.error };
};

/** Every field of a record type, hidden ones too (archived ones with `archived`). */
export const useAllFields = (
  contentType: ContentType,
  { archived = false }: { archived?: boolean } = {},
) => {
  const query = useQuery(
    orpc.fields.list.queryOptions({ input: { contentType, archived }, staleTime: 60_000 }),
  );

  return { fields: query.data?.data ?? [], loading: query.isPending, error: query.error };
};

/** Fields under their groups, groups in order; fields without a group come last (`group: null`). */
export const groupFields = (groups: FieldGroup[], fields: Field[]) => {
  const known = new Set(groups.map((group) => group.id));

  const sections: { group: FieldGroup | null; fields: Field[] }[] = groups.map((group) => ({
    group,
    fields: fields.filter((field) => field.groupId === group.id),
  }));

  const ungrouped = fields.filter((field) => !field.groupId || !known.has(field.groupId));

  return ungrouped.length ? [...sections, { group: null, fields: ungrouped }] : sections;
};

/**
 * The organisation's visible custom fields of a record type, ordered by group
 * then by field, with their groups (`sections`).
 */
export const useFields = (contentType: ContentType) => {
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
