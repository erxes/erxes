import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import {
  BMS_CUSTOM_TOUR_GROUP_ADD,
  BMS_CUSTOM_TOUR_GROUP_EDIT,
  BMS_CUSTOM_TOUR_GROUP_REMOVE,
  BMS_CUSTOM_TOUR_GROUPS,
  BMS_CUSTOM_TOUR_TYPE_ADD,
  BMS_CUSTOM_TOUR_TYPE_EDIT,
  BMS_CUSTOM_TOUR_TYPE_REMOVE,
  BMS_CUSTOM_TOUR_TYPES,
} from './graphql';
import { ICustomTourFieldGroup, ICustomTourType } from './types';

const showError = (error: Error) => {
  toast({
    title: 'Error',
    description: error.message,
    variant: 'destructive',
  });
};

export const useCustomTourTypes = (branchId?: string) => {
  const { data, loading, refetch } = useQuery(BMS_CUSTOM_TOUR_TYPES, {
    variables: { branchId },
    skip: !branchId,
  });

  const [addType] = useMutation(BMS_CUSTOM_TOUR_TYPE_ADD, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Custom tour type created' });
      refetch();
    },
    onError: showError,
  });

  const [editType] = useMutation(BMS_CUSTOM_TOUR_TYPE_EDIT, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Custom tour type updated' });
      refetch();
    },
    onError: showError,
  });

  const [removeType] = useMutation(BMS_CUSTOM_TOUR_TYPE_REMOVE, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Custom tour type deleted' });
      refetch();
    },
    onError: showError,
  });

  return {
    customTypes: (data?.bmsCustomTourTypes || []) as ICustomTourType[],
    loading,
    refetch,
    addType,
    editType,
    removeType,
  };
};

export const useCustomTourFieldGroups = (branchId?: string) => {
  const { data, loading, refetch } = useQuery(BMS_CUSTOM_TOUR_GROUPS, {
    variables: { branchId },
    skip: !branchId,
  });

  const [addGroup] = useMutation(BMS_CUSTOM_TOUR_GROUP_ADD, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Field group created' });
      refetch();
    },
    onError: showError,
  });

  const [editGroup] = useMutation(BMS_CUSTOM_TOUR_GROUP_EDIT, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Field group updated' });
      refetch();
    },
    onError: showError,
  });

  const [removeGroup] = useMutation(BMS_CUSTOM_TOUR_GROUP_REMOVE, {
    onCompleted: () => {
      toast({ title: 'Success', description: 'Field group deleted' });
      refetch();
    },
    onError: showError,
  });

  return {
    groups: (data?.bmsCustomTourGroupList?.list ||
      []) as ICustomTourFieldGroup[],
    loading,
    refetch,
    addGroup,
    editGroup,
    removeGroup,
  };
};
