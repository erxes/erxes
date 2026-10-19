'use client';

import { PIPELINE_CHANGED } from '@/deals/graphql/subscriptions/pipelineChange';
import { useAllDealsMap, useDealsBoard } from '@/deals/states/dealsBoardState';
import { useApolloClient, useSubscription } from '@apollo/client';
import { toast } from 'erxes-ui';
import { z } from 'zod';

const pipelineOrderEventSchema = z.object({
  item: z.object({
    _id: z.string(),
    stageId: z.string().nullish(),
    order: z.number().nullish(),
  }),
  aboveItemId: z.string().nullish(),
  destinationStageId: z.string(),
  oldStageId: z.string().nullish(),
});

export const usePipelineChanged = (pipelineId?: string) => {
  const [, setBoardState] = useDealsBoard();
  const [, setAllDealsMap] = useAllDealsMap();
  const client = useApolloClient();

  useSubscription(PIPELINE_CHANGED, {
    variables: pipelineId ? { _id: pipelineId } : undefined,
    skip: !pipelineId,
    onData: ({ data: result }) => {
      const payload = result.data?.salesPipelinesChanged;
      if (!payload?.data) return;

      const { processId } = payload;

      if (processId && processId === localStorage.getItem('processId')) {
        return;
      }

      if (payload.action === 'stageStatusChanged') {
        void client.refetchQueries({
          include: [
            'salesDealStages',
            'salesDealConversionStages',
            'SalesStages', // Still used by shared selectors and Loyalty.
          ],
        });
        return;
      }

      if (payload.action !== 'orderUpdated') return;
      const event = pipelineOrderEventSchema.safeParse(payload.data);
      // Stored JSON cannot hydrate computed card fields. Refresh active lists
      // after the immediate move, including when the moved card was not loaded.
      void client
        .refetchQueries({
          include: [...client.getObservableQueries('active').values()]
            .filter((query) => query.queryName === 'salesDealList')
            .map((query) => query.options.query),
        })
        .catch((error: unknown) =>
          toast({
            title: error instanceof Error ? error.message : String(error),
            variant: 'destructive',
          }),
        );
      if (!event.success) return;
      const { item, aboveItemId, destinationStageId, oldStageId } = event.data;

      if (!item?._id || !destinationStageId) return;

      const resolvedOldStageId = oldStageId || item.stageId || '';

      setBoardState((prev) => {
        if (!prev) return prev;

        const nextColumnItems = { ...prev.columnItems };
        const oldStageItems = [...(nextColumnItems[resolvedOldStageId] || [])];
        const srcIndex = oldStageItems.indexOf(item._id);

        nextColumnItems[resolvedOldStageId] = oldStageItems.filter(
          (id) => id !== item._id,
        );

        const destinationItems = [
          ...(nextColumnItems[destinationStageId] || []).filter(
            (id) => id !== item._id,
          ),
        ];

        let destIndex = aboveItemId ? destinationItems.indexOf(aboveItemId) : 0;

        if (destIndex < 0) {
          destIndex = 0;
        }

        if (
          aboveItemId &&
          ((destinationStageId === resolvedOldStageId &&
            destIndex < srcIndex) ||
            destinationStageId !== resolvedOldStageId)
        ) {
          destIndex = destIndex + 1;
        }

        destinationItems.splice(destIndex, 0, item._id);
        nextColumnItems[destinationStageId] = [...new Set(destinationItems)];

        const prevItem = prev.items[item._id];
        if (!prevItem) return prev;

        return {
          ...prev,
          items: {
            ...prev.items,
            [item._id]: {
              ...prevItem,
              order: item.order ?? prevItem.order,
              stageId: destinationStageId,
              columnId: destinationStageId,
            },
          },
          columnItems: nextColumnItems,
        };
      });

      setAllDealsMap((prev) => {
        const prevItem = prev[item._id];
        if (!prevItem) return prev;

        return {
          ...prev,
          [item._id]: {
            ...prevItem,
            order: item.order ?? prevItem.order,
            stageId: destinationStageId,
          },
        };
      });
    },
  });
};
