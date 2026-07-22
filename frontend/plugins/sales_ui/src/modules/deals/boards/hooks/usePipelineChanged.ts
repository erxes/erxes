'use client';

import { PIPELINE_CHANGED } from '@/deals/graphql/subscriptions/pipelineChange';
import {
  useAllDealsMap,
  useDealsBoard,
} from '@/deals/states/dealsBoardState';
import { IDeal } from '@/deals/types/deals';
import { useSubscription } from '@apollo/client';

interface ISalesPipelinesChangedPayload {
  salesPipelinesChanged: {
    _id: string;
    processId?: string;
    action: string;
    data: {
      item: IDeal;
      aboveItemId?: string;
      destinationStageId: string;
      oldStageId?: string;
    };
  };
}

export const usePipelineChanged = (pipelineId?: string) => {
  const [, setBoardState] = useDealsBoard();
  const [, setAllDealsMap] = useAllDealsMap();

  useSubscription<ISalesPipelinesChangedPayload>(PIPELINE_CHANGED, {
    variables: { _id: pipelineId },
    skip: !pipelineId,
    onData: ({ data: result }) => {
      const payload = result.data?.salesPipelinesChanged;
      if (!payload?.data) return;

      const { processId, action, data: changeData } = payload;

      if (processId && processId === localStorage.getItem('processId')) {
        return;
      }

      if (action !== 'orderUpdated') return;
      console.log('orderUpdated',changeData)
      const { item, aboveItemId, destinationStageId, oldStageId } = changeData;

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

        let destIndex = aboveItemId
          ? destinationItems.indexOf(aboveItemId)
          : 0;

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

        const prevItem = prev.items[item._id] || ({} as IDeal);

        return {
          ...prev,
          items: {
            ...prev.items,
            [item._id]: {
              ...prevItem,
              ...item,
              products: item.products ?? prevItem.products,
              productsData: item.productsData ?? prevItem.productsData,
              labels: item.labels ?? prevItem.labels,
              tags: item.tags ?? prevItem.tags,
              companies: item.companies ?? prevItem.companies,
              customers: item.customers ?? prevItem.customers,
              stageId: destinationStageId,
              columnId: destinationStageId,
            },
          },
          columnItems: nextColumnItems,
        };
      });

      setAllDealsMap((prev) => {
        const prevItem = prev[item._id] || ({} as IDeal);

        return {
          ...prev,
          [item._id]: {
            ...prevItem,
            ...item,
            products: item.products ?? prevItem.products,
            productsData: item.productsData ?? prevItem.productsData,
            labels: item.labels ?? prevItem.labels,
            tags: item.tags ?? prevItem.tags,
            companies: item.companies ?? prevItem.companies,
            customers: item.customers ?? prevItem.customers,
            stageId: destinationStageId,
          },
        };
      });
    },
  });
};
