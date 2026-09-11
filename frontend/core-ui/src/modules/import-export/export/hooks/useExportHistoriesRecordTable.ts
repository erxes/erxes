import { useTranslation } from 'react-i18next';
import { useImportExportTypes } from '@/import-export/hooks/useImportExportTypes';
import { EXPORT_HISTORIES_CURSOR_SESSION_KEY } from '@/import-export/settings/constants/importExportStatusOptions';
import { useImportExportHistoryVariables } from '@/import-export/settings/hooks/useImportExportHistoryVariables';
import { exportHistoryColumns } from '../components/ExportHistoryColumns';
import { useExportHistories } from './useExportHistories';

export const useExportHistoriesRecordTable = () => {
  const { t } = useTranslation('importExport');
  const variables = useImportExportHistoryVariables();

  const { importExportTypes } = useImportExportTypes({ operation: 'EXPORT' });

  const {
    list,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
  } = useExportHistories(variables);

  return {
    error,
    list,
    loading,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
    contentTypes: importExportTypes,
    columns: exportHistoryColumns({ t, contentTypes: importExportTypes }),
    RECORD_TABLE_SESSION_KEY: EXPORT_HISTORIES_CURSOR_SESSION_KEY,
    isEmpty: !loading && !list.length,
  };
};
