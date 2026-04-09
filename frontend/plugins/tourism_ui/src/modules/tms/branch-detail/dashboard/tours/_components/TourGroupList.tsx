import { getCoreRowModel, Row, TableOptions } from '@tanstack/react-table';
import { IconShoppingCartX } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import { RecordTable, RecordTableTree, Sheet } from 'erxes-ui';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';
import { useTourGroups } from '../hooks/useTourGroups';
import { TourCreateSheet } from './TourCreateSheet';
import { TourCommandBar } from './TourCommandBar';
import { GroupedTourColumns, TourGroupRow } from './TourGroupColumns';
import { flattenGroups } from './TourGroupUtils';
import { TourEditForm } from './TourEditForm';
import { TourSideTab } from './TourOrdersSidePanel';

export const TourGroupList = ({
  branchId,
  branchLanguages,
  mainLanguage,
}: {
  branchId: string;
  branchLanguages?: string[];
  mainLanguage?: string;
}) => {
  const activeLang = useAtomValue(activeLangAtom);
  const language = activeLang || mainLanguage;

  const { groups, loading, total } = useTourGroups({
    variables: { branchId, language },
  });

  const [editTourId, setEditTourId] = useState<string | null>(null);
  const [sideTab, setSideTab] = useState<TourSideTab | null>(null);

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
    return (
      <EmptyState
        branchId={branchId}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
      />
    );
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
        onOpenChange={(open) => {
          if (!open) {
            setEditTourId(null);
            setSideTab(null);
          }
        }}
      >
        <Sheet.View
          className={`p-0 transition-all duration-200 ${
            sideTab
              ? 'w-[1220px] sm:max-w-[1220px]'
              : 'w-[900px] sm:max-w-[900px]'
          }`}
        >
          {editTourId && (
            <TourEditForm
              tourId={editTourId}
              branchId={branchId}
              branchLanguages={branchLanguages}
              mainLanguage={mainLanguage}
              onSuccess={() => {
                setEditTourId(null);
                setSideTab(null);
              }}
              sideTab={sideTab}
              onSideTabChange={setSideTab}
            />
          )}
        </Sheet.View>
      </Sheet>
    </RecordTable.Provider>
  );
};

function EmptyState({
  branchId,
  branchLanguages,
  mainLanguage,
}: {
  branchId: string;
  branchLanguages?: string[];
  mainLanguage?: string;
}) {
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
      <TourCreateSheet
        branchId={branchId}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
      />
    </div>
  );
}
