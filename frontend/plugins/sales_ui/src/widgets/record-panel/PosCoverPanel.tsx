import { DealCardProducts } from '@/deals/boards/components/DealsBoardCardDetails';
import { options as paymentTypeOptions } from '@/pos/constants';
import { usePosCoversQuery } from '@/pos/pos-covers/detail/hook/usePosCoversQuery';
import { useRemovePosCover } from '@/pos/pos-covers/hooks/usePosCoverRemove';
import {
  IconAlignLeft,
  IconBuildingStore,
  IconCalendar,
  IconCalendarDue,
  IconCircleDot,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import {
  Button,
  Empty,
  isDefined,
  Skeleton,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PanelField, useSidePanel } from 'ui-modules';
import {
  PosPanelAside,
  PosPanelDetailLayout,
  PosPanelFields,
  PosPanelText,
} from '~/widgets/record-panel/PosPanelShared';

const formatDate = (value?: string | number | Date | null) =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';

const CASH_PAID_TYPE = 'cashAmount';

const getPaidTypeLabel = (paidType?: string | null) =>
  paymentTypeOptions.find((option) => option.value === paidType)?.label ||
  paidType ||
  '-';

export const PosCoverPanelTitle = ({ coverId }: { coverId: string }) => {
  const { t } = useTranslation('sales');
  const { posCovers: cover, loading } = usePosCoversQuery(coverId);

  if (loading && !cover) {
    return <Skeleton className="h-4 w-32" />;
  }

  return cover?.posName || t('cover-detail');
};

export const PosCoverPanelActions = ({ coverId }: { coverId: string }) => {
  const { t } = useTranslation('sales');
  const { removePosCover, loading } = useRemovePosCover();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { close } = useSidePanel();

  const handleDelete = () =>
    confirm({ message: t('delete-pos-cover-single-confirm') }).then(() =>
      removePosCover([coverId], {
        onCompleted: () => {
          toast({
            title: t('success'),
            description: t('pos-cover-deleted', { count: 1 }),
          });
          close();
        },
        onError: (error) =>
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          }),
      }),
    );

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:text-destructive"
      title={t('delete')}
      aria-label={t('delete')}
      disabled={loading}
      onClick={handleDelete}
    >
      <IconTrash />
    </Button>
  );
};

export const PosCoverPanelDetail = ({ coverId }: { coverId: string }) => {
  const { t } = useTranslation('sales');
  const { posCovers: cover, loading } = usePosCoversQuery(coverId);
  const details = (cover?.details || []).filter(isDefined);
  const total = details
    .flatMap((detail) => detail.paidSummary || [])
    .reduce((sum, summary) => sum + (summary?.amount || 0), 0);

  return (
    <PosPanelDetailLayout
      loading={loading}
      hasRecord={!!cover}
      emptyMessage={t('cover-not-found')}
    >
      {cover && (
        <>
          <PosPanelFields>
            <PanelField
              icon={IconCalendar}
              label={t('begin-date')}
              cell={false}
            >
              <PosPanelText>{formatDate(cover.beginDate)}</PosPanelText>
            </PanelField>
            <PanelField
              icon={IconCalendarDue}
              label={t('end-date')}
              cell={false}
            >
              <PosPanelText>{formatDate(cover.endDate)}</PosPanelText>
            </PanelField>
            <PanelField icon={IconUser} label={t('user')} cell={false}>
              <PosPanelText>
                {cover.user?.email || cover.user?.username || '-'}
              </PosPanelText>
            </PanelField>
            <PanelField icon={IconBuildingStore} label={t('pos')} cell={false}>
              <PosPanelText>{cover.posName || '-'}</PosPanelText>
            </PanelField>
            <PanelField icon={IconCircleDot} label={t('status')} cell={false}>
              <PosPanelText>
                {cover.status ? t(cover.status) : '-'}
              </PosPanelText>
            </PanelField>
            <PanelField
              icon={IconAlignLeft}
              label={t('description')}
              cell={false}
            >
              <PosPanelText>{cover.description || '-'}</PosPanelText>
            </PanelField>
          </PosPanelFields>
          <PosPanelAside>
            <div className="flex items-center justify-between gap-2 px-1 text-sm font-medium">
              <span>{t('total-amount')}</span>
              <span className="tabular-nums">{total.toLocaleString()}</span>
            </div>
            {details.length ? (
              <div className="flex flex-col gap-2 pt-2">
                {details.map((detail) => {
                  const isCash = detail.paidType === CASH_PAID_TYPE;

                  return (
                    <DealCardProducts
                      key={detail._id}
                      label={getPaidTypeLabel(detail.paidType)}
                      totalLabel={t('total')}
                      items={(detail.paidSummary || [])
                        .filter(isDefined)
                        .map((summary, index) => ({
                          _id: summary._id || `${index}`,
                          name: isCash
                            ? (summary.kindOfVal || 0).toLocaleString()
                            : getPaidTypeLabel(detail.paidType),
                          quantity: isCash ? summary.value || 0 : 1,
                          unitPrice: isCash
                            ? summary.kindOfVal || 0
                            : summary.amount || 0,
                          amount: summary.amount || 0,
                        }))}
                      maxVisible={(detail.paidSummary || []).length}
                    />
                  );
                })}
              </div>
            ) : (
              <Empty className="py-6">
                <Empty.Header>
                  <Empty.Title>{t('no-payment-details')}</Empty.Title>
                  <Empty.Description>
                    {t('cover-no-payment-breakdown')}
                  </Empty.Description>
                </Empty.Header>
              </Empty>
            )}
          </PosPanelAside>
        </>
      )}
    </PosPanelDetailLayout>
  );
};
