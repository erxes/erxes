import { useImportExportTypes } from '@/import-export/hooks/useImportExportTypes';
import { useQueryState } from 'erxes-ui/hooks/use-query-state';
import { importHistoryColumns } from '../components/ImportHistoryColumns';
import { useImportHistories } from './useImportHistories';

export const useImportHistoriesRecordTable = () => {
  const [selectedEntityType] = useQueryState<string>('type', {
    defaultValue: 'all',
  });

  const RECORD_TABLE_SESSION_KEY = `import_histories_cursor_${selectedEntityType}`;

  const {
    importExportTypes,
    loading: typesLoading,
    error: typesError,
  } = useImportExportTypes({
    operation: 'IMPORT',
  });
  const {
    list,
    totalCount,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
  } = useImportHistories({
    entityTypes:
      selectedEntityType === 'all' || !selectedEntityType
        ? undefined
        : [selectedEntityType],
  });
  const columns = importHistoryColumns();

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
