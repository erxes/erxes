import { RecordTable } from 'erxes-ui';
import { useUoms } from '../../hooks/useUoms';
import { uomsColumns } from './UomsColumns';
import { IconRulerMeasure } from '@tabler/icons-react';
import { UomsCommandBar } from './UomsCommandBar';
import { AddUomSheet } from './AddUomSheet';

export const UomsRecordTable = () => {
  const { uoms, loading } = useUoms();

  return (
    <RecordTable.Provider
      columns={uomsColumns}
      data={uoms || []}
      className="h-full"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={10} />}
            {!loading && (uoms?.length ?? 0) === 0 && (
              <div className="flex justify-center px-8 w-full h-full">
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="mb-6">
                    <IconRulerMeasure
                      size={64}
                      className="mx-auto mb-4 text-muted-foreground"
                    />
                    <h3 className="mb-2 text-xl font-semibold">No UOMs yet</h3>
                    <p className="max-w-md text-muted-foreground">
                      Get started by creating your first UOM.
                    </p>
                  </div>
                  <AddUomSheet />
                </div>
              </div>
            )}
            {!loading && (uoms?.length ?? 0) > 0 && <RecordTable.RowList />}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <UomsCommandBar />
    </RecordTable.Provider>
  );
};
