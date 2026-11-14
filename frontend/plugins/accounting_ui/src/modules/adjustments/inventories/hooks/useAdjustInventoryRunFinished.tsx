import { useEffect, useRef } from 'react';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  ADJ_INV_STATUSES,
  IAdjustInventory,
} from '@/adjustments/inventories/types/AdjustInventory';

export const useAdjustInventoryRunFinished = (
  adjustId: string | null | undefined,
  adjustInventory: IAdjustInventory | null | undefined,
  onFinished: () => Promise<unknown>,
) => {
  const { t } = useTranslation('accounting');
  const status = adjustInventory?.status;
  const checkedAt = adjustInventory?.checkedAt;
  const prevRef = useRef({ adjustId, status, checkedAt });

  useEffect(() => {
    const prev = prevRef.current;

    if (
      prev.adjustId === adjustId &&
      prev.status &&
      status !== ADJ_INV_STATUSES.RUNNING &&
      (prev.status === ADJ_INV_STATUSES.RUNNING || prev.checkedAt !== checkedAt)
    ) {
      onFinished().catch((error: Error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      });
    }

    prevRef.current = { adjustId, status, checkedAt };
  }, [adjustId, status, checkedAt, onFinished, t]);
};
