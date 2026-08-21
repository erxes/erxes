import {
  ADD_CHECKLISTS,
  CHECKLIST_ITEMS_ADD,
  CHECKLIST_ITEMS_EDIT,
  CHECKLIST_ITEMS_ORDER,
  CHECKLIST_ITEMS_REMOVE,
  EDIT_CHECKLISTS,
  REMOVE_CHECKLISTS,
} from '@/deals/graphql/mutations/ChecklistMutations';
import { GET_CHECKLISTS } from '@/deals/graphql/queries/ChecklistQueries';
import {
  CHECKLIST_DETAIL_CHANGED,
  CHECKLISTS_CHANGED,
} from '@/deals/graphql/subscriptions/checklistSubscriptions';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { IChecklist, IChecklistItem } from '@/deals/types/checklists';
import {
  MutationHookOptions,
  QueryHookOptions,
  useMutation,
  useQuery,
} from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';

function useDealContentTypeId(passedContentTypeId?: string | null) {
  const [activeDealId] = useAtom(dealDetailSheetState);
  const [salesItemId] = useQueryState<string>('salesItemId');

  return passedContentTypeId || salesItemId || activeDealId;
}

type ChecklistAddResult = { salesChecklistsAdd: IChecklist };
type ChecklistEditResult = { salesChecklistsEdit: IChecklist };
type ChecklistRemoveResult = { salesChecklistsRemove: Pick<IChecklist, '_id'> };
type ChecklistItemAddResult = { salesChecklistItemsAdd: IChecklistItem };
type ChecklistItemEditResult = { salesChecklistItemsEdit: IChecklistItem };
type ChecklistItemRemoveResult = {
  salesChecklistItemsRemove: Pick<IChecklistItem, '_id'>;
};
type ChecklistItemOrderResult = {
  salesChecklistItemsOrder: Pick<IChecklistItem, '_id'>;
};
type ChecklistVariables = Partial<{
  _id: string;
  contentTypeId: string | null;
  title: string;
}>;

type ChecklistItemVariables = Partial<{
  _id: string;
  checklistId: string;
  content: string;
  isChecked: boolean;
}>;

type ChecklistItemOrderVariables = Partial<{
  _id: string;
  destinationIndex: number;
}>;

export function useChecklistsAdd(
  options?: MutationHookOptions<ChecklistAddResult, ChecklistVariables>,
) {
  const contentTypeId = useDealContentTypeId(options?.variables?.contentTypeId);

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

export function useChecklistsEdit(
  options?: MutationHookOptions<ChecklistEditResult, ChecklistVariables>,
) {
  const [salesChecklistsEdit, { loading, error }] = useMutation(
    EDIT_CHECKLISTS,
    {
      ...options,
    },
  );

  return {
    salesChecklistsEdit,
    loading,
    error,
  };
}

export function useChecklistsRemove(
  options?: MutationHookOptions<ChecklistRemoveResult, ChecklistVariables>,
) {
  const contentTypeId = useDealContentTypeId(options?.variables?.contentTypeId);

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
  options?: MutationHookOptions<ChecklistItemAddResult, ChecklistItemVariables>,
) {
  const [salesChecklistItemsAdd, { loading, error }] = useMutation<
    ChecklistItemAddResult,
    ChecklistItemVariables
  >(CHECKLIST_ITEMS_ADD, {
    ...options,
  });

  return {
    salesChecklistItemsAdd,
    loading,
    error,
  };
}

export function useChecklistItemsEdit(
  options?: MutationHookOptions<
    ChecklistItemEditResult,
    ChecklistItemVariables
  >,
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
  options?: MutationHookOptions<
    ChecklistItemRemoveResult,
    ChecklistItemVariables
  >,
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
  options?: MutationHookOptions<
    ChecklistItemOrderResult,
    ChecklistItemOrderVariables
  >,
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

interface ISalesChecklistDetailChangedPayload {
  salesChecklistDetailChanged: IChecklist;
}

interface ISalesChecklistsChangedPayload {
  salesChecklistsChanged: IChecklist;
}

export const useChecklists = (
  options?: QueryHookOptions<{ salesChecklists: IChecklist[] }>,
) => {
  const contentTypeId = useDealContentTypeId(options?.variables?.contentTypeId);

  const { data, loading, error, subscribeToMore, refetch } = useQuery<{
    salesChecklists: IChecklist[];
  }>(GET_CHECKLISTS, {
    ...options,
    variables: {
      ...options?.variables,
      contentTypeId,
    },
    skip: !contentTypeId || options?.skip,
  });

  const checklistIds = useMemo(
    () =>
      data?.salesChecklists?.map((checklist) => checklist._id).join(',') ?? '',
    [data?.salesChecklists],
  );

  useEffect(() => {
    if (!contentTypeId) return;

    const unsubscribe = subscribeToMore<ISalesChecklistsChangedPayload>({
      document: CHECKLISTS_CHANGED,
      variables: {
        contentType: 'deal',
        contentTypeId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data?.salesChecklistsChanged) {
          return prev;
        }

        refetch();

        return prev;
      },
    });

    return unsubscribe;
  }, [contentTypeId, refetch, subscribeToMore]);

  useEffect(() => {
    if (!contentTypeId || !checklistIds) return;

    const unsubscribes = checklistIds.split(',').map((_id) =>
      subscribeToMore<ISalesChecklistDetailChangedPayload>({
        document: CHECKLIST_DETAIL_CHANGED,
        variables: { _id },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data?.salesChecklistDetailChanged) {
            return prev;
          }

          refetch();

          return prev;
        },
      }),
    );

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [checklistIds, contentTypeId, refetch, subscribeToMore]);

  return { checklists: data?.salesChecklists, loading, error, refetch };
};
