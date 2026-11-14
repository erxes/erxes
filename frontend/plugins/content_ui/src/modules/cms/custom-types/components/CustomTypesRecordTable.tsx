import { RecordTable } from 'erxes-ui';
import { createCustomTypesColumns } from './CustomTypesColumn';
import { useCustomTypes } from '../hooks/useCustomTypes';
import { CustomTypesCommandBar } from './customer-types-command-bar/CustomTypesCommandBar';
import { CONTENT_RECORD_TABLE_SCROLL_CLASS_NAME } from '@/cms/shared/constants/recordTable';

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
    onEdit || (() => undefined),
    refetch,
  );

  return (
    <RecordTable.Provider
      columns={columns}
      data={customTypes || []}
      className={`m-3 ${CONTENT_RECORD_TABLE_SCROLL_CLASS_NAME}`}
      stickyColumns={['more', 'checkbox', 'name']}
      tableId="content_custom_types_record_table"
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          {loading && !customTypes?.length && (
            <RecordTable.RowSkeleton rows={40} />
          )}
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
      {onBulkDelete && <CustomTypesCommandBar onBulkDelete={onBulkDelete} />}
    </RecordTable.Provider>
  );
};
