import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TOUR_CUSTOM_FIELD_GROUPS,
  TOUR_CUSTOM_FIELD_GROUP_ADD,
  TOUR_CUSTOM_FIELD_GROUP_EDIT,
  TOUR_CUSTOM_FIELD_GROUP_REMOVE,
  TOUR_CUSTOM_TYPES,
  TOUR_CUSTOM_TYPE_ADD,
  TOUR_CUSTOM_TYPE_EDIT,
  TOUR_CUSTOM_TYPE_REMOVE,
} from '../tours/graphql/customFields';
import type {
  ITourCustomField,
  ITourCustomFieldGroup,
  ITourCustomPostType,
} from '../tours/hooks/useTourCustomFields';
import { SYSTEM_TOUR_TYPE, toGroupFieldsInput } from './customFieldUtils';

const TOUR_TYPE_REFETCH_QUERIES = ['TourismTourCustomTypes'];
const FIELD_GROUP_REFETCH_QUERIES = ['TourismTourCustomFieldGroups'];

export const useTourTypeList = (branchId: string) => {
  const { data, loading } = useQuery<{
    bmsCustomTourTypes: ITourCustomPostType[];
  }>(TOUR_CUSTOM_TYPES, {
    variables: { branchId },
    skip: !branchId,
    fetchPolicy: 'cache-and-network',
  });

  const customTypes = useMemo(
    () => data?.bmsCustomTourTypes || [],
    [data?.bmsCustomTourTypes],
  );
  const typeOptions = useMemo(
    () => [SYSTEM_TOUR_TYPE, ...customTypes],
    [customTypes],
  );

  return { customTypes, typeOptions, loading };
};

export const useFieldGroupList = (branchId: string) => {
  const { data, loading, refetch } = useQuery<{
    bmsCustomTourGroupList: {
      list: ITourCustomFieldGroup[];
    };
  }>(TOUR_CUSTOM_FIELD_GROUPS, {
    variables: { branchId },
    skip: !branchId,
    fetchPolicy: 'cache-and-network',
  });

  const groups = useMemo(
    () => data?.bmsCustomTourGroupList?.list || [],
    [data?.bmsCustomTourGroupList?.list],
  );

  return { groups, loading, refetch };
};

const useErrorToast = () => {
  const { t } = useTranslation('tourism');

  return useCallback(
    (error: ApolloError) =>
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      }),
    [t],
  );
};

export const useTourTypeMutations = () => {
  const { t } = useTranslation('tourism');
  const onError = useErrorToast();

  const [addType, { loading: adding }] = useMutation<{
    bmsCustomTourTypesAdd: ITourCustomPostType;
  }>(TOUR_CUSTOM_TYPE_ADD, {
    refetchQueries: TOUR_TYPE_REFETCH_QUERIES,
    onError,
  });
  const [editType, { loading: editing }] = useMutation(TOUR_CUSTOM_TYPE_EDIT, {
    refetchQueries: TOUR_TYPE_REFETCH_QUERIES,
    onError,
  });
  const [removeType, { loading: removing }] = useMutation(
    TOUR_CUSTOM_TYPE_REMOVE,
    {
      refetchQueries: [
        ...TOUR_TYPE_REFETCH_QUERIES,
        ...FIELD_GROUP_REFETCH_QUERIES,
      ],
      onError,
    },
  );

  const removeTourType = (typeId: string, onDone?: () => void) =>
    removeType({
      variables: { _id: typeId },
      onCompleted: () => {
        toast({ title: t('success'), description: t('tour-type-removed') });
        onDone?.();
      },
    });

  return { addType, editType, removeTourType, adding, editing, removing };
};

export const useFieldGroupMutations = () => {
  const { t } = useTranslation('tourism');
  const onError = useErrorToast();

  const [addGroup, { loading: adding }] = useMutation<{
    bmsCustomTourGroupsAdd: { _id: string };
  }>(TOUR_CUSTOM_FIELD_GROUP_ADD, {
    refetchQueries: FIELD_GROUP_REFETCH_QUERIES,
    onError,
  });
  const [editGroup, { loading: editing }] = useMutation(
    TOUR_CUSTOM_FIELD_GROUP_EDIT,
    {
      refetchQueries: FIELD_GROUP_REFETCH_QUERIES,
      awaitRefetchQueries: true,
      onError,
    },
  );
  const [removeGroup, { loading: removing }] = useMutation(
    TOUR_CUSTOM_FIELD_GROUP_REMOVE,
    { refetchQueries: FIELD_GROUP_REFETCH_QUERIES, onError },
  );

  const removeFieldGroup = (groupId: string, onDone?: () => void) =>
    removeGroup({
      variables: { _id: groupId },
      onCompleted: () => {
        toast({ title: t('success'), description: t('field-group-removed') });
        onDone?.();
      },
    });

  const saveGroupFields = (
    group: ITourCustomFieldGroup,
    fields: ITourCustomField[],
    branchId: string,
    onDone?: () => void,
  ) =>
    editGroup({
      variables: {
        _id: group._id,
        input: toGroupFieldsInput(group, fields, branchId),
      },
      onCompleted: () => {
        toast({ title: t('success'), description: t('field-group-updated') });
        onDone?.();
      },
    });

  return {
    addGroup,
    editGroup,
    removeFieldGroup,
    saveGroupFields,
    adding,
    editing,
    removing,
  };
};
