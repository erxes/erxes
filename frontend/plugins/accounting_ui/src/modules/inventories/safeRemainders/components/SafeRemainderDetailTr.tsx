import { IconCrane, IconTrashX } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Button, Label, RecordTable, Spinner, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSafeRemainderDetail } from '../hooks/useSafeRemainderDetail';
import { useSafeRemainderDetails } from '../hooks/useSafeRemainderDetails';
import { useSafeRemainderRemove } from '../hooks/useSafeRemainderRemove';
import {
  useSafeRemainderCancel,
  useSafeRemainderDoTr,
  useSafeRemainderSubmit,
  useSafeRemainderUndoTr,
} from '../hooks/useSafeRemainderChange';
import {
  ISafeRemainder,
  SAFE_REMAINDER_STATUSES,
} from '../types/SafeRemainder';
import { safeRemDetailTableColumns } from './SafeRemainderDetailColumns';
import { SafeRemDetailCommandbar } from './SafeRemainderDetailCommandbar';
import { SafeRemainderDetailFilter } from './SafeRemainderDetailFilters';

export const SafeRemainderDetailTr = () => {
  const { t } = useTranslation('accounting');
  const [id] = useQueryState<string>('id');

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

  const { submitSafeRemainder } = useSafeRemainderSubmit();
  const { cancelSafeRemainder } = useSafeRemainderCancel();
  const { doTrSafeRemainder } = useSafeRemainderDoTr();
  const { undoTrSafeRemainder } = useSafeRemainderUndoTr();
  const { removeSafeRemainder } = useSafeRemainderRemove();

  if (loading || detailsLoading) {
    return <Spinner />;
  }

  if (!id) {
    return;
  }

  const renderEvents = () => {
    const status = safeRemainder?.status || SAFE_REMAINDER_STATUSES.DRAFT;
    switch (status) {
      case SAFE_REMAINDER_STATUSES.DRAFT:
        return (
          <>
            <Button onClick={() => submitSafeRemainder(id)}>
              <IconCrane />
              {t('submit')}
            </Button>
            <Button
              variant="secondary"
              className="text-destructive"
              onClick={() => removeSafeRemainder({ variables: { _id: id } })}
            >
              <IconTrashX />
              {t('delete')}
            </Button>
          </>
        );
      case SAFE_REMAINDER_STATUSES.DONE:
        return (
          <>
            <Button onClick={() => doTrSafeRemainder(id)}>
              <IconCrane />
              {t('do-transaction')}
            </Button>
            <Button
              variant="secondary"
              className="text-destructive"
              onClick={() => cancelSafeRemainder(id)}
            >
              <IconTrashX />
              {t('cancel-submition')}
            </Button>
          </>
        );

      case SAFE_REMAINDER_STATUSES.PUBLISHED:
        return (
          <>
            <Button onClick={() => doTrSafeRemainder(id)}>
              <IconCrane />
              {t('redo-transaction')}
            </Button>
            <Button
              variant="secondary"
              className="text-destructive"
              onClick={() => undoTrSafeRemainder(id)}
            >
              <IconTrashX />
              {t('undo-transaction')}
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="m-3 flex-auto">
        <h3 className="text-lg font-bold">{t('inventory-census-detail')}</h3>
        <div className="flex items-center col-span-2 xl:col-span-3 gap-6">
          <div>
            {safeRemainder && <StatusBar safeRemainder={safeRemainder} />}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-accent-foreground">{t('status')}:</span>
            <span className="text-primary font-bold">
              {safeRemainder?.status}
            </span>
          </div>
          {renderEvents()}
        </div>
      </div>

      <SafeRemainderDetailFilter />

      <RecordTable.Provider
        columns={safeRemDetailTableColumns}
        data={safeRemainderItems || []}
        stickyColumns={[]}
        className="m-3"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
              {!detailsLoading &&
                safeRemainderItemsCount > safeRemainderItems?.length && (
                  <RecordTable.RowSkeleton
                    rows={4}
                    handleInView={handleFetchMore}
                  />
                )}
            </RecordTable.Body>
          </RecordTable>
          <SafeRemDetailCommandbar />
        </RecordTable.Scroll>
      </RecordTable.Provider>
    </>
  );
};

const StatusBar = ({ safeRemainder }: { safeRemainder: ISafeRemainder }) => {
  const { t } = useTranslation('accounting');
  return (
    <div className="flex flex-wrap items-center justify-start gap-2 max-w-full">
      <div className="flex items-center gap-2 text-sm">
        <Label>{t('date')}:</Label>
        <span>{dayjs(safeRemainder.date).format('YYYY-MM-DD HH:mm:ss')}</span>
        <span className="text-accent-foreground">{'|'}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Label>{t('branch')}:</Label>
        <span>{`${safeRemainder.branch?.code ?? ''} - ${
          safeRemainder.branch?.title ?? ''
        }`}</span>
        <span className="text-accent-foreground">{'|'}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Label>{t('department')}:</Label>
        <span>{`${safeRemainder.department?.code ?? ''} - ${
          safeRemainder.department?.title ?? ''
        }`}</span>
        <span className="text-accent-foreground">{'|'}</span>
      </div>
      {safeRemainder.productCategoryId && (
        <div className="flex items-center gap-2 text-sm">
          <Label>{t('product-category')}:</Label>
          <span>{`${safeRemainder.productCategory?.code ?? ''} - ${
            safeRemainder.productCategory?.name ?? ''
          }`}</span>
          <span className="text-accent-foreground">{'|'}</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-sm">
        <Label>{t('description')}:</Label>
        <span>{safeRemainder.description}</span>
      </div>
    </div>
  );
};
