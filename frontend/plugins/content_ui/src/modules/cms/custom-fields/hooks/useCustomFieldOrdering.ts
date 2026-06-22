import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useMemo } from 'react';
import { CMS_CUSTOM_FIELD_GROUPS } from '../graphql/queries';
import { CMS_CUSTOM_FIELD_GROUP_EDIT } from '../graphql/mutations';
import { ICustomFieldGroup } from '../types/customFieldTypes';
import { compareByOrder } from '../utils/comparators';

/**
 * Drag-reorder helpers for custom field groups/fields usable from the content
 * detail editors (posts, pages, categories). Order is stored on the shared
 * group definition (`order` column + `fields` array), so reordering here changes
 * it globally — consistent with the Custom Fields settings page.
 */
export const useCustomFieldOrdering = (websiteId?: string) => {
  const { data, refetch } = useQuery(CMS_CUSTOM_FIELD_GROUPS, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId,
    fetchPolicy: 'cache-first',
  });

  // Full group set in global order — needed to translate a reorder of the
  // (possibly filtered) visible groups back into global `order` values.
  const allGroups = useMemo(
    () =>
      [
        ...((data?.cmsCustomFieldGroupList?.list || []) as ICustomFieldGroup[]),
      ].sort(compareByOrder),
    [data?.cmsCustomFieldGroupList?.list],
  );

  const [editGroup] = useMutation(CMS_CUSTOM_FIELD_GROUP_EDIT, {
    onError: (error) =>
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      }),
  });

  // Reorder only the visible (filtered) groups while keeping hidden groups in
  // their existing slots, then persist any group whose 1-based order changed.
  const reorderVisibleGroups = async (
    visibleOrdered: { _id: string }[],
  ) => {
    const visibleIds = new Set(visibleOrdered.map((g) => g._id));
    const byId = new Map(allGroups.map((g) => [g._id, g]));
    const queue = visibleOrdered
      .map((g) => byId.get(g._id))
      .filter((g): g is ICustomFieldGroup => Boolean(g));

    let cursor = 0;
    const fullOrdered = allGroups.map((g) =>
      visibleIds.has(g._id) ? queue[cursor++] : g,
    );

    const changes = fullOrdered
      .map((group, index) => ({ group, order: index + 1 }))
      .filter(({ group, order }) => group.order !== order);

    if (!changes.length) return;

    await Promise.all(
      changes.map(({ group, order }) =>
        editGroup({
          variables: { _id: group._id, input: { label: group.label, order } },
        }),
      ),
    );
    await refetch();
  };

  // Persist a new field order within a group. `reorderedFields` is the group's
  // `fields` array in its desired order (array position is the display order).
  const reorderFields = async (
    groupId: string,
    reorderedFields: ICustomFieldGroup['fields'],
  ) => {
    const group = allGroups.find((g) => g._id === groupId);
    if (!group) return;

    await editGroup({
      variables: {
        _id: groupId,
        input: { label: group.label, fields: reorderedFields },
      },
    });
    await refetch();
  };

  return { reorderVisibleGroups, reorderFields };
};
