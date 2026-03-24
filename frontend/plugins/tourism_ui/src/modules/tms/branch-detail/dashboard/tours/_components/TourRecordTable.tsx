import { IconMapRoute } from '@tabler/icons-react';
import { RecordTable, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { TourCreateSheet } from './TourCreateSheet';
import { TourEditForm } from './TourEditForm';
import { TourColumns } from './TourColumns';
import { useTours } from '../hooks/useTours';
import { TOURS_CURSOR_SESSION_KEY } from '../constants/tourCursorSessionKey';
import { TourCommandBar } from './TourCommandBar';
import { useCategories } from '../../category/hooks/useCategories';

export const TourRecordTable = ({ branchId }: { branchId: string }) => {
  const [editTourId, setEditTourId] = useState<string | null>(null);

  const { tours, handleFetchMore, loading, pageInfo, totalCount } = useTours({
    variables: { branchId },
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const { categories } = useCategories();

  const handleEdit = (tourId: string) => {
    setEditTourId(tourId);
  };

  const handleCloseEdit = (open: boolean) => {
    if (!open) setEditTourId(null);
  };
  if (!loading && (totalCount ?? 0) === 0) {
    return <EmptyStateRow branchId={branchId} />;
  }

  return (
    <>
      <RecordTable.Provider
        columns={TourColumns(categories || [], handleEdit)}
        data={tours || []}
        className="h-full"
        stickyColumns={['checkbox', 'name']}
      >
        <TourCommandBar />
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={tours?.length}
          sessionKey={TOURS_CURSOR_SESSION_KEY}
        >
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.CursorBackwardSkeleton
                handleFetchMore={handleFetchMore}
              />
              {loading && <RecordTable.RowSkeleton rows={30} />}
              <RecordTable.RowList />
              <RecordTable.CursorForwardSkeleton
                handleFetchMore={handleFetchMore}
              />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.CursorProvider>
      </RecordTable.Provider>

      <Sheet open={!!editTourId} onOpenChange={handleCloseEdit}>
        <Sheet.View className="w-[800px] sm:max-w-[800px] p-0">
          {editTourId && (
            <TourEditForm
              tourId={editTourId}
              branchId={branchId}
              onSuccess={() => handleCloseEdit(false)}
            />
          )}
        </Sheet.View>
      </Sheet>
    </>
  );
};

function EmptyStateRow({ branchId }: { branchId: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 w-full min-h-[80vh] text-center">
      <IconMapRoute size={64} stroke={1.5} className="text-muted-foreground" />
      <h2 className="text-lg font-semibold text-muted-foreground">
        No tour yet
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Create your first tour to get started.
      </p>
      <TourCreateSheet branchId={branchId} />
    </div>
  );
}
