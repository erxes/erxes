import { MutationHookOptions, useMutation } from '@apollo/client';

import { DEALS_CHANGE } from '@/deals/graphql/mutations/DealsMutations';
import {
  DealsBoardState,
  useAllDealsMap,
  useDealsBoard,
} from '@/deals/states/dealsBoardState';
import { IDeal } from '@/deals/types/deals';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export function useDealsChange(options?: MutationHookOptions<any, any>) {
  const { t } = useTranslation('sales');
  const [changeDeals, { loading, error }] = useMutation(DEALS_CHANGE, {
    ...options,
    variables: {
      ...options?.variables,
    },
    onCompleted: (...args) => {
      toast({
        title: t('deal-order-updated'),
        variant: 'default',
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: t('error'),
        description: err.message || t('update-failed'),
        variant: 'destructive',
      });
    },
  });

  return {
    changeDeals,
    loading,
    error,
  };
}

export function useMoveDealStage(options?: MutationHookOptions<any, any>) {
  const { changeDeals, loading, error } = useDealsChange(options);
  const [boardState, setBoardState] = useDealsBoard();
  const [allDealsMap, setAllDealsMap] = useAllDealsMap();

  const moveDealStage = ({
    deal,
    stageId,
    aboveItemId,
    onCompleted,
  }: {
    deal: IDeal;
    stageId: string | string[];
    aboveItemId?: string;
    onCompleted?: () => void;
  }) => {
    const destinationStageId = Array.isArray(stageId) ? stageId[0] : stageId;
    const nextAboveItemId = aboveItemId ?? '';

    if (!destinationStageId || destinationStageId === deal.stageId) {
      onCompleted?.();
      return Promise.resolve(null);
    }

    if (boardState) {
      setBoardState((prev: DealsBoardState | null) => {
        if (!prev) return prev;

        const nextColumnItems = Object.fromEntries(
          Object.entries(prev.columnItems).map(([columnId, itemIds]) => [
            columnId,
            (itemIds ?? []).filter((itemId: string) => itemId !== deal._id),
          ]),
        );

        const destinationItems = nextColumnItems[destinationStageId] || [];
        const insertIndex = nextAboveItemId
          ? destinationItems.indexOf(nextAboveItemId) + 1
          : 0;
        const normalizedIndex = insertIndex > 0 ? insertIndex : 0;

        destinationItems.splice(normalizedIndex, 0, deal._id);

        return {
          ...prev,
          items: {
            ...prev.items,
            [deal._id]: {
              ...(prev.items[deal._id] || deal),
              ...deal,
              stageId: destinationStageId,
              columnId: destinationStageId,
            },
          },
          columnItems: {
            ...nextColumnItems,
            [destinationStageId]: destinationItems,
          },
        };
      });

      setAllDealsMap((prev: Record<string, IDeal>) => ({
        ...prev,
        [deal._id]: {
          ...(prev[deal._id] || deal),
          ...deal,
          stageId: destinationStageId,
        },
      }));
    }

    const processId = Math.random().toString();
    localStorage.setItem('processId', processId);

    return changeDeals({
      variables: {
        itemId: deal._id,
        destinationStageId,
        sourceStageId: deal.stageId,
        aboveItemId: nextAboveItemId,
        processId,
      },
    })
      .then((result) => {
        onCompleted?.();
        return result;
      })
      .catch((mutationError) => {
        if (boardState) {
          setBoardState(boardState);
          setAllDealsMap(allDealsMap);
        }

        throw mutationError;
      });
  };

  return {
    moveDealStage,
    loading,
    error,
  };
}
