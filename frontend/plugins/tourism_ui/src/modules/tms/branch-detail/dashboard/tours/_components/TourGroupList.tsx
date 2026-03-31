import { getCoreRowModel, Row, TableOptions } from '@tanstack/react-table';
import { IconShoppingCartX } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { RecordTable, RecordTableTree, Sheet } from 'erxes-ui';
import { useTourGroups } from '../hooks/useTourGroups';
import { TourCreateSheet } from './TourCreateSheet';
import { TourCommandBar } from './TourCommandBar';
import { GroupedTourColumns, TourGroupRow } from './TourGroupColumns';
import { flattenGroups } from './TourGroupUtils';
import { TourEditForm } from './TourEditForm';

export const TourGroupList = ({ branchId }: { branchId: string }) => {
  const { groups, loading, total } = useTourGroups({
    variables: { branchId },
  });

  const [editTourId, setEditTourId] = useState<string | null>(null);

  const groupedTours = useMemo(() => flattenGroups(groups), [groups]);
  const columns = useMemo(
    () => GroupedTourColumns({ onEdit: (id) => setEditTourId(id) }),
    [],
  );
  const tableOptions: TableOptions<TourGroupRow> = useMemo(
    () => ({
      data: groupedTours,
      columns,
      getCoreRowModel: getCoreRowModel(),
      enableRowSelection: (row: Row<TourGroupRow>) => !row.original.isGroup,
    }),
    [columns, groupedTours],
  );

  if (!loading && total === 0) {
    return <EmptyState branchId={branchId} />;
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={groupedTours}
      className="h-full"
      stickyColumns={['checkbox', 'name']}
      tableOptions={tableOptions}
    >
      <RecordTableTree
        id="tour-groups-list"
        ordered
        length={groupedTours.length}
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              {loading && <RecordTable.RowSkeleton rows={30} />}
              <RecordTable.RowList Row={RecordTableTree.Row} />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTableTree>
      <TourCommandBar />
      <Sheet
        open={!!editTourId}
        onOpenChange={(open) => !open && setEditTourId(null)}
      >
        <Sheet.View className="w-[850px] sm:max-w-[850px] p-0">
          {editTourId && (
            <TourEditForm
              tourId={editTourId}
              branchId={branchId}
              onSuccess={() => setEditTourId(null)}
            />
          )}
        </Sheet.View>
      </Sheet>
    </RecordTable.Provider>
  );
};

function EmptyState({ branchId }: { branchId: string }) {
  return (
    <div className="flex flex-col gap-2 justify-center items-center p-6 w-full h-full text-center">
      <IconShoppingCartX
        size={64}
        stroke={1.5}
        className="text-muted-foreground"
      />
      <h2 className="text-lg font-semibold text-muted-foreground">
        No grouped tours yet
      </h2>
      <p className="mb-4 text-md text-muted-foreground">
        Tours with a group code will appear here.
      </p>
      <TourCreateSheet branchId={branchId} />
    </div>
  );
}
