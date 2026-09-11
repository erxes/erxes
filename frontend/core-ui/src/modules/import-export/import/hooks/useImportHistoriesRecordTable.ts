import { useTranslation } from 'react-i18next';
import { useImportExportTypes } from '@/import-export/hooks/useImportExportTypes';
import { IMPORT_HISTORIES_CURSOR_SESSION_KEY } from '@/import-export/settings/constants/importExportStatusOptions';
import { useImportExportHistoryVariables } from '@/import-export/settings/hooks/useImportExportHistoryVariables';
import { importHistoryColumns } from '../components/ImportHistoryColumns';
import { useImportHistories } from './useImportHistories';

export const useImportHistoriesRecordTable = () => {
  const { t } = useTranslation('importExport');
  const variables = useImportExportHistoryVariables();

  const { importExportTypes } = useImportExportTypes({ operation: 'IMPORT' });

  const {
    list,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
  } = useImportHistories(variables);

  return {
    error,
    list,
    loading,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
    contentTypes: importExportTypes,
    columns: importHistoryColumns({ t, contentTypes: importExportTypes }),
    RECORD_TABLE_SESSION_KEY: IMPORT_HISTORIES_CURSOR_SESSION_KEY,
    isEmpty: !loading && !list.length,
  };
};
