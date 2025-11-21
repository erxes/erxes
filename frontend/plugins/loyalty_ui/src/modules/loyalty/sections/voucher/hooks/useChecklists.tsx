import {
  ADD_CHECKLISTS,
  CHECKLIST_ITEMS_ADD,
  CHECKLIST_ITEMS_EDIT,
  CHECKLIST_ITEMS_ORDER,
  CHECKLIST_ITEMS_REMOVE,
  REMOVE_CHECKLISTS,
} from '@/deals/graphql/mutations/ChecklistMutations';
import { IChecklist, IChecklistItem } from '@/deals/types/checklists';
import { MutationHookOptions, useMutation } from '@apollo/client';
import { QueryHookOptions, useQuery } from '@apollo/client';

import { GET_CHECKLISTS } from '@/deals/graphql/queries/ChecklistQueries';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useAtom } from 'jotai';

type AddChecklistResult = {
  checklistsAdd: IChecklist;
};
type AddChecklistItemResult = {
  checklistItemsAdd: IChecklistItem;
};

export function useChecklistsAdd(
  options?: MutationHookOptions<AddChecklistResult, any>,
) {
  const [contentTypeId] = useAtom(dealDetailSheetState);

  const [checklistsAdd, { loading, error }] = useMutation(ADD_CHECKLISTS, {
    ...options,
    variables: {
      ...options?.variables,
      contentTypeId,
    },
    refetchQueries: [
      {
        query: GET_CHECKLISTS,
        variables: {
          ...options?.variables,
          contentTypeId,
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  return {
    checklistsAdd,
    loading,
    error,
  };
}

export function useChecklistsRemove(
  options?: MutationHookOptions<AddChecklistItemResult, any>,
) {
  const [contentTypeId] = useAtom(dealDetailSheetState);

  const [salesChecklistsRemove, { loading, error }] = useMutation(
    REMOVE_CHECKLISTS,
    {
      ...options,
      refetchQueries: [
        {
          query: GET_CHECKLISTS,
          variables: {
            ...options?.variables,
            contentTypeId,
          },
        },
      ],
      awaitRefetchQueries: true,
    },
  );

  return {
    salesChecklistsRemove,
    salesChecklistsRemoveLoading: loading,
    error,
  };
}

export function useChecklistItemsAdd(
  options?: MutationHookOptions<AddChecklistItemResult, any>,
) {
  const [salesChecklistItemsAdd, { loading, error }] = useMutation(
    CHECKLIST_ITEMS_ADD,
    {
      ...options,
    },
  );

  return {
    salesChecklistItemsAdd,
    loading,
    error,
  };
}

export function useChecklistItemsEdit(
  options?: MutationHookOptions<AddChecklistItemResult, any>,
) {
  const [salesChecklistItemsEdit, { loading, error }] = useMutation(
    CHECKLIST_ITEMS_EDIT,
    {
      ...options,
    },
  );

  return {
    salesChecklistItemsEdit,
    loading,
    error,
  };
}

export function useChecklistItemsRemove(
  options?: MutationHookOptions<AddChecklistItemResult, any>,
) {
  const [salesChecklistItemsRemove, { loading, error }] = useMutation(
    CHECKLIST_ITEMS_REMOVE,
    {
      ...options,
    },
  );

  return {
    salesChecklistItemsRemove,
    loading,
    error,
  };
}

export function useChecklistItemsReorder(
  options?: MutationHookOptions<AddChecklistItemResult, any>,
) {
  const [salesChecklistItemsReorder, { loading, error }] = useMutation(
    CHECKLIST_ITEMS_ORDER,
    {
      ...options,
    },
  );

  return {
    salesChecklistItemsReorder,
    loading,
    error,
  };
}

export const useChecklists = (
  options?: QueryHookOptions<{ salesChecklists: IChecklist[] }>,
) => {
  const [contentTypeId] = useAtom(dealDetailSheetState);

  const { data, loading, error } = useQuery<{ salesChecklists: IChecklist[] }>(
    GET_CHECKLISTS,
    {
      ...options,
      variables: {
        ...options?.variables,
        contentTypeId,
      },
    },
  );

  return { checklists: data?.salesChecklists, loading, error };
};
