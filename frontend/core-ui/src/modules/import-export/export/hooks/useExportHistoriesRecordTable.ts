import { useImportExportTypes } from '@/import-export/hooks/useImportExportTypes';
import { useQueryState } from 'erxes-ui/hooks/use-query-state';
import { exportHistoryColumns } from '../components/ExportHistoryColumns';
import { useExportHistories } from './useExportHistories';

export const useExportHistoriesRecordTable = () => {
  const [selectedEntityType] = useQueryState<string>('type', {
    defaultValue: 'all',
  });

  const RECORD_TABLE_SESSION_KEY = `export_histories_cursor_${selectedEntityType}`;

  const {
    importExportTypes,
    loading: typesLoading,
    error: typesError,
  } = useImportExportTypes({
    operation: 'EXPORT',
  });

  const {
    list,
    totalCount,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
  } = useExportHistories({
    entityTypes:
      selectedEntityType === 'all' || !selectedEntityType
        ? undefined
        : [selectedEntityType],
  });

  const columns = exportHistoryColumns(importExportTypes);

  const providerValue = {
    contentTypes: importExportTypes,
    loading,
    totalCount,
    typesLoading,
    typesError,
    columnsLength: columns.length,
  };

  return {
    error,
    list,
    loading,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
    columns,
    providerValue,
    RECORD_TABLE_SESSION_KEY,
    isEmpty: !loading && !list.length,
  };
};
