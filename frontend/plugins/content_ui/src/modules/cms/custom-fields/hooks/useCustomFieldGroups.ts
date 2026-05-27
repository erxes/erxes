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

export const useCustomFieldGroups = (websiteId?: string) => {
  const { data, loading, refetch } = useQuery(CMS_CUSTOM_FIELD_GROUPS, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId,
  });

  const groups = useMemo(
    () =>
      ((data?.cmsCustomFieldGroupList?.list || []) as ICustomFieldGroup[])
        .map((group) => ({
          ...group,
          fields: [...(group.fields || [])].sort(compareByLabel),
        }))
        .sort(compareByLabel),
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

  return {
    groups,
    loading,
    refetch,
    addGroup,
    editGroup,
    removeGroup,
  };
};
