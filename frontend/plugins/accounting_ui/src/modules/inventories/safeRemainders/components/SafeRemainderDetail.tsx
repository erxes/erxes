import {
  IconAccessPoint,
  IconCrane,
  IconTrashX,
} from '@tabler/icons-react';
import { Button, PageSubHeader, Spinner, useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { AccountingHeader } from '~/modules/layout/components/Header';
import {
  useSafeRemainderCancel,
  useSafeRemainderDoTr,
  useSafeRemainderReCalc,
  useSafeRemainderSubmit,
  useSafeRemainderUndoTr,
} from '../hooks/useSafeRemainderChange';
import { useSafeRemainderDetail } from '../hooks/useSafeRemainderDetail';
import { useSafeRemainderDetails } from '../hooks/useSafeRemainderDetails';
import { useSafeRemainderRemove } from '../hooks/useSafeRemainderRemove';
import { activeTabState } from '../states';
import {
  ISafeRemainder,
  SAFE_REMAINDER_STATUSES,
} from '../types/SafeRemainder';
import { SafeRemainderDetailFilter } from './SafeRemainderDetailFilters';
import { SafeRemainderDetailTabs } from './SafeRemainderDetailTabs';
import { SafeRemainderImport } from './SafeRemainderImport';

export const SafeRemainderDetail = () => {
  const { t } = useTranslation('accounting');
  const [id] = useQueryState<string>('id');
  const [activeTab, setActiveTab] = useAtom(activeTabState);
  const { safeRemainder, loading } = useSafeRemainderDetail({
    variables: { _id: id },
    skip: !id,
  });
  const {
    safeRemainderItems,
    safeRemainderItemsCount,
    loading: detailsLoading,
    handleFetchMore,
  } = useSafeRemainderDetails({
    variables: { remainderId: id },
    skip: !id,
  });
  const { reCalcSafeRemainder, loading: reCalcLoading } =
    useSafeRemainderReCalc();
  const { submitSafeRemainder, loading: submitLoading } =
    useSafeRemainderSubmit();
  const { cancelSafeRemainder, loading: cancelLoading } =
    useSafeRemainderCancel();
  const { doTrSafeRemainder, loading: doTrLoading } =
    useSafeRemainderDoTr();
  const { undoTrSafeRemainder, loading: undoTrLoading } =
    useSafeRemainderUndoTr();
  const { removeSafeRemainder, loading: removeLoading } =
    useSafeRemainderRemove();
  const actionLoading =
    reCalcLoading ||
    submitLoading ||
    cancelLoading ||
    doTrLoading ||
    undoTrLoading ||
    removeLoading;

  if (loading || detailsLoading) return <Spinner />;
  if (!id) return null;

  const renderActions = () => {
    const status = safeRemainder?.status ?? SAFE_REMAINDER_STATUSES.DRAFT;

    if (status === SAFE_REMAINDER_STATUSES.DRAFT) {
      return (
        <>
          <SafeRemainderImport safeRemainderId={id} />
          <Button
            disabled={actionLoading}
            onClick={() => reCalcSafeRemainder(id)}
          >
            <IconCrane />
            {t('recalc')}
          </Button>
          <Button
            disabled={actionLoading}
            onClick={() => submitSafeRemainder(id)}
          >
            <IconAccessPoint />
            {t('submit')}
          </Button>
          <Button
            variant="secondary"
            className="text-destructive"
            disabled={actionLoading}
            onClick={() => removeSafeRemainder({ variables: { _id: id } })}
          >
            <IconTrashX />
            {t('delete')}
          </Button>
        </>
      );
    }

    if (status === SAFE_REMAINDER_STATUSES.DONE) {
      return (
        <>
          <Button
            disabled={actionLoading}
            onClick={() => doTrSafeRemainder(id)}
          >
            <IconCrane />
            {t('do-transaction')}
          </Button>
          <Button
            variant="secondary"
            className="text-destructive"
            disabled={actionLoading}
            onClick={() => cancelSafeRemainder(id)}
          >
            <IconTrashX />
            {t('cancel-submition')}
          </Button>
        </>
      );
    }

    if (status === SAFE_REMAINDER_STATUSES.PUBLISHED) {
      return (
        <>
          <Button
            disabled={actionLoading}
            onClick={() => doTrSafeRemainder(id)}
          >
            <IconCrane />
            {t('redo-transaction')}
          </Button>
          <Button
            variant="secondary"
            className="text-destructive"
            disabled={actionLoading}
            onClick={() => undoTrSafeRemainder(id)}
          >
            <IconTrashX />
            {t('undo-transaction')}
          </Button>
        </>
      );
    }

    return null;
  };

  return (
    <>
      <AccountingHeader
        returnLink="/accounting/inventories/safe-remainders"
        returnText="Safe Remainders"
        skipSettings
        leftChildren={
          <span className="font-semibold">{t('inventory-census-detail')}</span>
        }
      >
        <div className="flex items-center gap-2 text-sm mr-1">
          <span className="text-accent-foreground">{t('status')}:</span>
          <span className="text-primary font-bold capitalize">
            {safeRemainder?.status}
          </span>
        </div>
        {renderActions()}
      </AccountingHeader>

      {safeRemainder && (
        <div className="flex-none border-b px-3 py-2 flex flex-wrap items-center gap-x-6 gap-y-2">
          <SafeRemainderStatusBar safeRemainder={safeRemainder} />
        </div>
      )}

      <PageSubHeader className="items-center">
        <SafeRemainderDetailFilter
          afterBar={
            <span className="text-sm text-muted-foreground">
              {safeRemainderItemsCount} {t('records-found', 'records found')}
            </span>
          }
        />
      </PageSubHeader>

      <SafeRemainderDetailTabs
        activeTab={activeTab}
        items={safeRemainderItems}
        loading={detailsLoading}
        totalCount={safeRemainderItemsCount}
        onActiveTabChange={setActiveTab}
        onFetchMore={handleFetchMore}
      />
    </>
  );
};

const SafeRemainderStatusBar = ({
  safeRemainder,
}: {
  safeRemainder: ISafeRemainder;
}) => {
  const { t } = useTranslation('accounting');
  const joinLabel = (code?: string, name?: string) =>
    [code, name].filter(Boolean).join(' - ');
  const items = [
    {
      label: t('date'),
      value: dayjs(safeRemainder.date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      label: t('branch'),
      value: joinLabel(safeRemainder.branch?.code, safeRemainder.branch?.title),
    },
    {
      label: t('department'),
      value: joinLabel(
        safeRemainder.department?.code,
        safeRemainder.department?.title,
      ),
    },
    ...(safeRemainder.productCategoryId
      ? [
          {
            label: t('product-category'),
            value: joinLabel(
              safeRemainder.productCategory?.code,
              safeRemainder.productCategory?.name,
            ),
          },
        ]
      : []),
    { label: t('description'), value: safeRemainder.description },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
      {items.map(({ label, value }) => (
        <div key={label} className="flex items-baseline gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <span className="text-sm font-medium text-foreground">
            {value || '-'}
          </span>
        </div>
      ))}
    </div>
  );
};
