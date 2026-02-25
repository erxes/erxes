import dayjs from 'dayjs';
import {
  Label,
  RecordTable,
  Spinner,
  useQueryState
} from 'erxes-ui';
import { useSafeRemainderDetail } from '../hooks/useSafeRemainderDetail';
import { useSafeRemainderDetails } from '../hooks/useSafeRemainderDetails';
import { useSafeRemainderRemove } from '../hooks/useSafeRemainderRemove';
import { useSafeRemainderSubmit } from '../hooks/useSafeRemainderSubmit';
import { ISafeRemainder } from '../types/SafeRemainder';
import { safeRemDetailTableColumns } from './SafeRemainderDetailColumns';
import { SafeRemainderDetailFilter } from './SafeRemainderDetailFilters';
import { SafeRemDetailCommandbar } from './SafeRemainderDetailCommandbar';

export const SafeRemainderDetail = () => {
  const [id] = useQueryState<string>('id');

  const { safeRemainder, loading } = useSafeRemainderDetail({
    variables: { _id: id },
    skip: !id,
  });

  const { safeRemainderItems, safeRemainderItemsCount, loading: detailsLoading, handleFetchMore } = useSafeRemainderDetails({
    variables: { remainderId: id },
    skip: !id,
  });

  const { submitSafeRemainder } = useSafeRemainderSubmit(id ?? '');
  const { removeSafeRemainder } = useSafeRemainderRemove(id ?? '');

  if (loading || detailsLoading) {
    return <Spinner />;
  }

  if (!id) {
    return;
  }

  const handleSubmit = () => {
    submitSafeRemainder();
  }

  const handleDelete = () => {
    removeSafeRemainder()
  }

  return (
    <>
      <div className="m-3 flex-auto">
        <h3 className="text-lg font-bold">
          Inventory Census Detail
        </h3>
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
          {/* {renderEvents()} */}
        </div>
      </div>

      <SafeRemainderDetailFilter />

      <RecordTable.Provider
        columns={safeRemDetailTableColumns}
        data={safeRemainderItems || []}
        stickyColumns={[]}
        className='m-3'
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
              {!detailsLoading && safeRemainderItemsCount > safeRemainderItems?.length && (
                <RecordTable.RowSkeleton rows={4} handleInView={handleFetchMore} />
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
}