import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useMemo } from 'react';
import { CMS_CUSTOM_FIELD_GROUPS } from '../graphql/queries';
import {
  CMS_CUSTOM_FIELD_GROUP_ADD,
  CMS_CUSTOM_FIELD_GROUP_EDIT,
  CMS_CUSTOM_FIELD_GROUP_REMOVE,
} from '../graphql/mutations';
import { ICustomFieldGroup } from '../types/customFieldTypes';

const compareByLabel = (
  a: { _id?: string; label?: string; code?: string },
  b: { _id?: string; label?: string; code?: string },
) => {
  const aValue = a.label || a.code || a._id || '';
  const bValue = b.label || b.code || b._id || '';

  if (!aValue && !bValue) return 0;
  if (!aValue) return 1;
  if (!bValue) return -1;

  return aValue.localeCompare(bValue, 'en', {
    numeric: true,
    sensitivity: 'base',
  });
};

// Groups are manually ordered via the `order` column; fall back to label for
// groups that don't have an order yet so they stay stable.
const compareByOrder = (a: ICustomFieldGroup, b: ICustomFieldGroup) => {
  const aOrder = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
  const bOrder = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;

  if (aOrder !== bOrder) return aOrder - bOrder;
  return compareByLabel(a, b);
};

export const useCustomFieldGroups = (websiteId?: string) => {
  const { data, loading, refetch } = useQuery(CMS_CUSTOM_FIELD_GROUPS, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId,
  });

  // Preserve the stored `fields` array order (that is the field display order);
  // only the groups themselves are sorted, by their `order` column.
  const groups = useMemo(
    () =>
      [...((data?.cmsCustomFieldGroupList?.list || []) as ICustomFieldGroup[])]
        .sort(compareByOrder),
    [data?.cmsCustomFieldGroupList?.list],
  );

  const [addGroup] = useMutation(CMS_CUSTOM_FIELD_GROUP_ADD, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Field group created!' });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [editGroup] = useMutation(CMS_CUSTOM_FIELD_GROUP_EDIT, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Field group updated!' });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [removeGroup] = useMutation(CMS_CUSTOM_FIELD_GROUP_REMOVE, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Field group deleted!' });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Silent edit used for drag-reordering so we don't toast on every persisted
  // position change.
  const [editGroupSilent] = useMutation(CMS_CUSTOM_FIELD_GROUP_EDIT, {
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Persist a new group order. `orderedGroups` is the full list in its desired
  // order; only groups whose 1-based position changed are written.
  // `label` is required by CustomFieldGroupInput, so it is always sent.
  const reorderGroups = async (orderedGroups: ICustomFieldGroup[]) => {
    const changes = orderedGroups
      .map((group, index) => ({ group, order: index + 1 }))
      .filter(({ group, order }) => group.order !== order);

    if (!changes.length) return;

    await Promise.all(
      changes.map(({ group, order }) =>
        editGroupSilent({
          variables: { _id: group._id, input: { label: group.label, order } },
        }),
      ),
    );
    await refetch();
  };

  // Persist a new field order within a group. `reorderedFields` is the group's
  // `fields` array in its desired order (array position is the display order).
  // `label` is required by CustomFieldGroupInput, so it is always sent.
  const reorderFields = async (
    groupId: string,
    reorderedFields: ICustomFieldGroup['fields'],
  ) => {
    const group = groups.find((g) => g._id === groupId);
    if (!group) return;

    await editGroupSilent({
      variables: {
        _id: groupId,
        input: { label: group.label, fields: reorderedFields },
      },
    });
    await refetch();
  };

  return {
    groups,
    loading,
    refetch,
    addGroup,
    editGroup,
    removeGroup,
    reorderGroups,
    reorderFields,
  };
};
