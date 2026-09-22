import { ImportExportHistoriesFilter } from '@/import-export/settings/components/ImportExportHistoriesFilter';
import { IMPORT_HISTORIES_CURSOR_SESSION_KEY } from '@/import-export/settings/constants/importExportStatusOptions';
import { useImportExportHistoryVariables } from '@/import-export/settings/hooks/useImportExportHistoryVariables';
import { useImportHistories } from '../hooks/useImportHistories';

export const ImportHistoriesFilter = () => {
  const { totalCount, loading } = useImportHistories(
    useImportExportHistoryVariables(),
  );

  return (
    <ImportExportHistoriesFilter
      id="import-histories-filter"
      sessionKey={IMPORT_HISTORIES_CURSOR_SESSION_KEY}
      totalCount={totalCount}
      loading={loading}
    />
  );
};
