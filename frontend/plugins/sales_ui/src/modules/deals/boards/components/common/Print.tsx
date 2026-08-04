import { IconPrinter } from '@tabler/icons-react';
import { Button, Form, Sheet, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { PrintDealsRecordTable } from '@/deals/boards/components/common/print/PrintDealsRecordTable';
import { PrintSettingsFields } from '@/deals/boards/components/common/print/PrintSettingsFields';
import {
  DEALS_LIMIT,
  DEFAULT_PAPER_SIZE,
} from '@/deals/boards/components/common/print/constants';
import type {
  PrintDialogProps,
  PrintFormValues,
} from '@/deals/boards/components/common/print/types';
import { usePrintDealDocument } from '@/deals/boards/components/common/print/usePrintDealDocument';
import { useDeals } from '@/deals/cards/hooks/useDeals';

export const PrintDialog = ({ open, onClose, stageId }: PrintDialogProps) => {
  const { t } = useTranslation('sales');
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const { deals = [], loading } = useDeals({
    variables: {
      stageId,
      limit: DEALS_LIMIT,
    },
    skip: !open,
    fetchPolicy: 'network-only',
  });
  const form = useForm<PrintFormValues>({
    defaultValues: {
      copies: 1,
      width: DEFAULT_PAPER_SIZE.width,
      brandId: '',
      branchId: '',
      departmentId: '',
      documentId: '',
    },
  });
  const { print, processing } = usePrintDealDocument({
    form,
    selectedDealIds,
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <Sheet.View className="inset-y-0 right-0 h-dvh rounded-none border-l p-0 sm:max-w-2xl">
        <Form {...form}>
          <form
            className="flex h-full min-h-0 flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              void print();
            }}
          >
            <Sheet.Header>
              <Sheet.Title className="flex items-center gap-2">
                <IconPrinter className="size-4" />
                {t('print-document')}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="min-h-0 flex-1 overflow-y-auto rounded-none border-b-0">
              <div className="border-b px-5 py-5">
                <PrintSettingsFields form={form} />
              </div>

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
              <Button type="submit" disabled={loading || processing}>
                {processing ? <Spinner /> : <IconPrinter />}
                {t('print')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
