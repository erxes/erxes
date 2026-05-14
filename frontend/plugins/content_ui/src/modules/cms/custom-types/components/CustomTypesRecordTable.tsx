import { RecordTable } from 'erxes-ui';
import { createCustomTypesColumns } from './CustomTypesColumn';
import { useCustomTypes } from '../hooks/useCustomTypes';
import { CustomTypesCommandBar } from './customer-types-command-bar/CustomTypesCommandBar';

interface CustomTypesRecordTableProps {
  clientPortalId: string;
  onEdit?: (customType: any) => void;
  onBulkDelete?: (ids: string[]) => Promise<void> | void;
}

export const CustomTypesRecordTable = ({
  clientPortalId,
  onEdit,
  onBulkDelete,
}: CustomTypesRecordTableProps) => {
  const { customTypes, loading, refetch } = useCustomTypes({
    clientPortalId,
  });

  const columns = createCustomTypesColumns(
    clientPortalId,
    onEdit || (() => {}),
    refetch,
  );

  return (
    <RecordTable.Provider
      columns={columns}
      data={customTypes || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          {loading && <RecordTable.RowSkeleton rows={40} />}
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
      {onBulkDelete && <CustomTypesCommandBar onBulkDelete={onBulkDelete} />}
    </RecordTable.Provider>
  );
};
