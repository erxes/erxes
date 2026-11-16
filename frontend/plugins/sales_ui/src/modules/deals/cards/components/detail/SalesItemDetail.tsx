'use client';

import {
  IconAlertCircle,
  IconArrowLeft,
  IconCloudExclamation,
} from '@tabler/icons-react';
import {
  Button,
  Empty,
  FocusSheet,
  isDefined,
  ScrollArea,
  Separator,
  Sheet,
  useQueryState,
} from 'erxes-ui';
import { DataExtensionRecordSection } from 'ui-modules';
import { DealActivityTab } from './DealActivityTab';

import { AttachmentProvider } from '@/deals/cards/components/detail/overview/attachments/AttachmentContext';
import { SalesNoteAndComment } from '@/deals/cards/components/detail/overview/NoteAndComment';
import { SalesFormFields } from '@/deals/cards/components/detail/overview/SalesFormFields';
import { ProductsPayment } from '@/deals/cards/components/detail/product/components/ProductPayment';
import { ProductsList } from '@/deals/cards/components/detail/product/components/product-list/ProductsList';
import { SalesItemDetailHeader } from '@/deals/cards/components/detail/SalesItemDetailHeader';
import { DealSideWidgets } from '@/deals/cards/components/detail/DealSideWidgets';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import { DealsProvider } from '@/deals/context/DealContext';
import { DealVoucherRow } from '@/deals/loyaltyVouchers/components/DealVoucherRow';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDealCustomFieldEdit } from '../../hooks/useDealCustomFieldEdit';
import { DealPipelineProperties } from './DealPipelineProperties';

/**
 * The deal in one scroll: what it sells and how it is paid first, then its
 * work and history; its fields in a column beside it, and the side rail
 * (contacts and the enabled plugins' widgets) at the edge.
 */
const SalesItemDetailView = () => {
  const { t } = useTranslation('sales');
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  const { deal, loading, error, refetch } = useDealDetail();
  const initialAttachments = useMemo(
    () => deal?.attachments?.filter(isDefined) ?? [],
    [deal?.attachments],
  );
  const pipelineId = deal?.pipelineId || deal?.pipeline?._id || '';

  return (
    <FocusSheet.View
      loading={loading}
      error={!!error}
      notFound={!deal}
      notFoundState={<SalesItemDetailEmptyState />}
      errorState={<SalesItemDetailErrorState />}
      className="lg:w-[calc(100vw-(--spacing(4)))]"
    >
      {deal && (
        <>
          <SalesItemDetailHeader deal={deal} showSidebarToggle={false} />
          <FocusSheet.Content>
            {selectedTab === 'activity' ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="w-full xl:max-w-6xl mx-auto px-6 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTab(null)}
                  >
                    <IconArrowLeft />
                    {t('back')}
                  </Button>
                </div>
                <div className="min-h-0 flex-1">
                  <DealActivityTab dealId={deal._id} />
                </div>
              </div>
            ) : (
              <ScrollArea className="min-h-0 flex-1">
                <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem]">
                  <div className="flex min-w-0 flex-col gap-6 p-6">
                    <section
                      className="flex h-[30rem] flex-col gap-2"
                      aria-label={t('products')}
                    >
                      <h3 className="text-sm font-medium">{t('products')}</h3>
                      <DealVoucherRow deal={deal} />
                      <div className="min-h-0 flex-1">
                        <ProductsList
                          products={deal.products}
                          productsData={deal.productsData}
                          dealId={deal._id}
                          pipelineId={pipelineId}
                          refetch={refetch}
                          tickUsed={deal.stage?.defaultTick ?? true}
                        />
                      </div>
                    </section>
                    <section
                      className="flex flex-col gap-2"
                      aria-label={t('payments')}
                    >
                      <h3 className="text-sm font-medium">{t('payments')}</h3>
                      <ProductsPayment deal={deal} />
                    </section>
                    <AttachmentProvider
                      key={deal._id}
                      dealId={deal._id}
                      initialAttachments={initialAttachments}
                    >
                      <div className="flex flex-col gap-3">
                        <SalesFormFields deal={deal} parts="work" />
                      </div>
                    </AttachmentProvider>
                    <Separator />
                    <SalesNoteAndComment dealId={deal._id} />
                  </div>
                  <aside className="flex min-w-0 flex-col gap-6 border-t p-6 lg:border-l lg:border-t-0 lg:p-4">
                    <SalesFormFields
                      key={deal._id}
                      deal={deal}
                      parts="fields"
                      layout="panel"
                    />
                    <DealPipelineProperties
                      key={`${deal._id}-${JSON.stringify(
                        deal.propertiesData || {},
                      )}`}
                      pipelineId={pipelineId}
                      propertiesData={deal.propertiesData || {}}
                      mutateHook={useDealCustomFieldEdit}
                      id={deal._id}
                    />
                    <DataExtensionRecordSection
                      recordType="sales:deal"
                      recordId={deal._id}
                    />
                  </aside>
                </div>
              </ScrollArea>
            )}
            <DealSideWidgets
              dealId={deal._id}
              customerId={deal.customers?.[0]?._id}
              companyId={deal.companies?.[0]?._id}
            />
          </FocusSheet.Content>
        </>
      )}
    </FocusSheet.View>
  );
};

export const SalesItemDetail = () => {
  const setActiveDealId = useSetAtom(dealDetailSheetState);
  const [salesItemId, setSalesItemId] = useQueryState<string>('salesItemId');

  useEffect(() => {
    setActiveDealId(salesItemId);
  }, [salesItemId, setActiveDealId]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSalesItemId(null);
    }
  };

  return (
    <FocusSheet open={Boolean(salesItemId)} onOpenChange={handleOpenChange}>
      <DealsProvider>
        <SalesItemDetailView />
      </DealsProvider>
    </FocusSheet>
  );
};

const SalesItemDetailCloseAction = () => {
  const { t } = useTranslation('sales');
  return (
    <Empty.Content>
      <Sheet.Close asChild>
        <Button variant="outline">{t('close')}</Button>
      </Sheet.Close>
    </Empty.Content>
  );
};

const SalesItemDetailEmptyState = () => {
  const { t } = useTranslation('sales');
  return (
    <div className="flex items-center justify-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconCloudExclamation />
          </Empty.Media>
          <Empty.Title>{t('deal-not-found')}</Empty.Title>
          <Empty.Description>{t('no-deal-with-id')}</Empty.Description>
        </Empty.Header>
        <SalesItemDetailCloseAction />
      </Empty>
    </div>
  );
};

const SalesItemDetailErrorState = () => {
  const { t } = useTranslation('sales');
  const { error } = useDealDetail();

  return (
    <div className="flex items-center justify-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle />
          </Empty.Media>
          <Empty.Title>{t('error')}</Empty.Title>
          <Empty.Description>{error?.message}</Empty.Description>
        </Empty.Header>
        <SalesItemDetailCloseAction />
      </Empty>
    </div>
  );
};
