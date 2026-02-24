import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { CMS_CUSTOM_FIELD_GROUPS } from '../graphql/queries';
import {
  CMS_CUSTOM_FIELD_GROUP_ADD,
  CMS_CUSTOM_FIELD_GROUP_EDIT,
  CMS_CUSTOM_FIELD_GROUP_REMOVE,
} from '../graphql/mutations';
import { ICustomFieldGroup } from '../types/customFieldTypes';

export const useCustomFieldGroups = (websiteId?: string) => {
  const { data, loading, refetch } = useQuery(CMS_CUSTOM_FIELD_GROUPS, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId,
  });

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
    groups: (data?.cmsCustomFieldGroupList?.list || []) as ICustomFieldGroup[],
    loading,
    refetch,
    addGroup,
    editGroup,
    removeGroup,
  };
};
