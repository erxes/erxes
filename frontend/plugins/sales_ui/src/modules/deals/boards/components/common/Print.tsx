import { IconPrinter } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PrintDocument } from 'ui-modules';

import { PrintDealsRecordTable } from '@/deals/boards/components/common/print/PrintDealsRecordTable';
import {
  DEAL_DOCUMENT_CONTENT_TYPE,
  DEALS_LIMIT,
} from '@/deals/boards/components/common/print/constants';
import type { PrintDialogProps } from '@/deals/boards/components/common/print/types';
import { useDeals } from '@/deals/cards/hooks/useDeals';

export const PrintDialog = ({ open, onClose, stageId }: PrintDialogProps) => {
  const { t } = useTranslation('sales');
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { deals = [], loading } = useDeals({
    variables: {
      stageId,
      limit: DEALS_LIMIT,
    },
    skip: !open,
    fetchPolicy: 'network-only',
  });
  const selectedDeals = deals.filter((deal) =>
    selectedDealIds.includes(deal._id),
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose();
    }
  };

  if (showPreview) {
    return (
      <PrintDocument
        items={selectedDeals}
        contentType={DEAL_DOCUMENT_CONTENT_TYPE}
        open={open}
        onOpenChange={handleOpenChange}
        trigger={null}
      />
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Sheet.View className="inset-y-0 right-0 h-dvh rounded-none border-l p-0 sm:max-w-2xl">
        <div className="flex h-full min-h-0 flex-col">
          <Sheet.Header>
            <Sheet.Title className="flex items-center gap-2">
              <IconPrinter className="size-4" />
              {t('print-document')}
            </Sheet.Title>
            <Sheet.Description className="sr-only">
              {t('please-select-at-least-one-deal')}
            </Sheet.Description>
            <Sheet.Close />
          </Sheet.Header>

          <Sheet.Content className="min-h-0 flex-1 overflow-y-auto rounded-none border-b-0">
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t('deals')}</h3>
                <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                  {selectedDealIds.length}/{deals.length}
                </span>
              </div>
              <PrintDealsRecordTable
                deals={deals}
                loading={loading}
                onSelectionChange={setSelectedDealIds}
              />
            </div>
          </Sheet.Content>

          <Sheet.Footer className="shrink-0 border-t bg-background">
            <Sheet.Close asChild>
              <Button type="button" variant="ghost">
                {t('cancel')}
              </Button>
            </Sheet.Close>
            <Button
              type="button"
              disabled={loading || selectedDeals.length === 0}
              onClick={() => setShowPreview(true)}
            >
              {t('next')}
            </Button>
          </Sheet.Footer>
        </div>
      </Sheet.View>
    </Sheet>
  );
};
