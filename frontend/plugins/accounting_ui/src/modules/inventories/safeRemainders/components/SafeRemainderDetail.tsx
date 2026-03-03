import { IconCrane, IconTrashX } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Button, Label, RecordTable, Spinner, useQueryState } from 'erxes-ui';
import { useSafeRemainderDetail } from '../hooks/useSafeRemainderDetail';
import { useSafeRemainderDetails } from '../hooks/useSafeRemainderDetails';
import { useSafeRemainderRemove } from '../hooks/useSafeRemainderRemove';
import { useSafeRemainderCancel, useSafeRemainderDoTr, useSafeRemainderSubmit, useSafeRemainderUndoTr } from '../hooks/useSafeRemainderChange';
import { ISafeRemainder, SAFE_REMAINDER_STATUSES } from '../types/SafeRemainder';
import { safeRemDetailTableColumns } from './SafeRemainderDetailColumns';
import { SafeRemDetailCommandbar } from './SafeRemainderDetailCommandbar';
import { SafeRemainderDetailFilter } from './SafeRemainderDetailFilters';

export const SafeRemainderDetail = () => {
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
            <Button
              onClick={() => submitSafeRemainder(id)}
            >
              <IconCrane />
              Submit
            </Button>
            <Button
              variant="secondary"
              className="text-destructive"
              onClick={() => removeSafeRemainder({ variables: { _id: id } })}
            >
              <IconTrashX />
              Delete
            </Button>
          </>
        )
      case SAFE_REMAINDER_STATUSES.DONE:
        return (
          <>
            <Button
              onClick={() => doTrSafeRemainder(id)}
            >
              <IconCrane />
              Do Transaction
            </Button>
            <Button
              variant="secondary"
              className="text-destructive"
              onClick={() => cancelSafeRemainder(id)}
            >
              <IconTrashX />
              Cancel Submition
            </Button>
          </>
        )

      case SAFE_REMAINDER_STATUSES.PUBLISHED:
        return (
          <Button
            variant="secondary"
            className="text-destructive"
            onClick={() => undoTrSafeRemainder(id)}
          >
            <IconTrashX />
            Undo transaction
          </Button>
        )
      default:
        return null;
    }
  }

  return (
    <>
      <div className="m-3 flex-auto">
        <h3 className="text-lg font-bold">Inventory Census Detail</h3>
        <div className="flex items-center col-span-2 xl:col-span-3 gap-6">
          <div>
            {safeRemainder && <StatusBar safeRemainder={safeRemainder} />}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-accent-foreground">Status:</span>
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
  return (
    <div className="flex flex-wrap items-center justify-start gap-2 max-w-full">
      <div className="flex items-center gap-2 text-sm">
        <Label>Date:</Label>
        <span>{dayjs(safeRemainder.date).format('YYYY-MM-DD HH:mm:ss')}</span>
        <span className="text-accent-foreground">{'|'}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Label>Branch:</Label>
        <span>{`${safeRemainder.branch?.code} - ${safeRemainder.branch?.title}`}</span>
        <span className="text-accent-foreground">{'|'}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Label>Department:</Label>
        <span>{`${safeRemainder.department?.code} - ${safeRemainder.department?.title}`}</span>
        <span className="text-accent-foreground">{'|'}</span>
      </div>
      {safeRemainder.productCategoryId && (
        <div className="flex items-center gap-2 text-sm">
          <Label>Product Category:</Label>
          <span>{`${safeRemainder.productCategory?.code} - ${safeRemainder.productCategory?.name}`}</span>
          <span className="text-accent-foreground">{'|'}</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-sm">
        <Label>Description:</Label>
        <span>{safeRemainder.description}</span>
      </div>
    </div>
  );
};
