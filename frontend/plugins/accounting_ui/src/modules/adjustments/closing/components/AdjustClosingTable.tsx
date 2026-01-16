import { RecordTable } from 'erxes-ui';
import { useAdjustClosing } from '../hooks/useAdjustClosing';
import { adjustClosingTableColumns } from './AdjustClosingColumns';
import { useFields, useFieldsColumns } from 'ui-modules';
import { ColumnDef } from '@tanstack/table-core';
import { IAdjustClosingDetail } from '../types/AdjustClosing';
import { useAdjustCustomeFieldsEdit } from '../hooks/useAdjustClosingCustomFields';

export const AdjustClosingTable = () => {
  const { adjustClosing, loading, totalCount, handleFetchMore } =
    useAdjustClosing();
  const { fields, loading: fieldsLoading } = useFields({
    contentType: 'accountig:adjust',
  });

  const columns = useFieldsColumns({
    fields,
    mutateHook: useAdjustCustomeFieldsEdit,
  });

  return (
    <RecordTable.Provider
      columns={
        [
          ...adjustClosingTableColumns,
          ...columns,
        ] as ColumnDef<IAdjustClosingDetail>[]
      }
      data={adjustClosing || []}
      stickyColumns={['checkbox']}
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {!loading && totalCount > adjustClosing?.length && (
              <RecordTable.RowSkeleton
                rows={4}
                handleInView={handleFetchMore}
              />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
};
