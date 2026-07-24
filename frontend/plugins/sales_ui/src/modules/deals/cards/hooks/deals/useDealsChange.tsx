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

const removeItemFromColumns = (
  columnItems: DealsBoardState['columnItems'],
  itemId: string,
) =>
  Object.fromEntries(
    Object.entries(columnItems).map(([columnId, itemIds]) => [
      columnId,
      (itemIds ?? []).filter((id: string) => id !== itemId),
    ]),
  );

export function useDealsChange(options?: MutationHookOptions) {
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
      options?.onError?.(err);
    },
  });

  return {
    changeDeals,
    loading,
    error,
  };
}

export function useMoveDealStage(options?: MutationHookOptions) {
  const { changeDeals, loading, error } = useDealsChange(options);
  const [boardState, setBoardState] = useDealsBoard();
  const [, setAllDealsMap] = useAllDealsMap();

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

        const nextColumnItems = removeItemFromColumns(
          prev.columnItems,
          deal._id,
        );

        const destinationItems = nextColumnItems[destinationStageId] || [];
        const insertIndex = nextAboveItemId
          ? destinationItems.indexOf(nextAboveItemId) + 1
          : 0;
        const normalizedIndex = Math.max(insertIndex, 0);

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

    const processId = crypto.randomUUID();
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
        // Revert only this move's delta on the current state rather than
        // restoring the whole pre-move snapshot, so a later move or
        // subscription update in the meantime isn't clobbered.
        if (boardState) {
          const sourceStageId = deal.stageId || '';
          const originalStageItems = boardState.columnItems[sourceStageId] || [];
          const originalIndex = originalStageItems.indexOf(deal._id);

          setBoardState((prev: DealsBoardState | null) => {
            if (!prev) return prev;

            const revertedColumnItems = removeItemFromColumns(
              prev.columnItems,
              deal._id,
            );

            const sourceItems = revertedColumnItems[sourceStageId] || [];
            const insertIndex =
              originalIndex >= 0 && originalIndex <= sourceItems.length
                ? originalIndex
                : sourceItems.length;

            sourceItems.splice(insertIndex, 0, deal._id);

            return {
              ...prev,
              items: {
                ...prev.items,
                [deal._id]: {
                  ...(prev.items[deal._id] || deal),
                  ...deal,
                  stageId: sourceStageId,
                  columnId: sourceStageId,
                },
              },
              columnItems: {
                ...revertedColumnItems,
                [sourceStageId]: sourceItems,
              },
            };
          });

          setAllDealsMap((prev: Record<string, IDeal>) => ({
            ...prev,
            [deal._id]: {
              ...(prev[deal._id] || deal),
              ...deal,
              stageId: sourceStageId,
            },
          }));
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
