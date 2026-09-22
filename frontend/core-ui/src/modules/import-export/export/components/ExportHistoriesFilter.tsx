import { ImportExportHistoriesFilter } from '@/import-export/settings/components/ImportExportHistoriesFilter';
import { EXPORT_HISTORIES_CURSOR_SESSION_KEY } from '@/import-export/settings/constants/importExportStatusOptions';
import { useImportExportHistoryVariables } from '@/import-export/settings/hooks/useImportExportHistoryVariables';
import { useExportHistories } from '../hooks/useExportHistories';

export const ExportHistoriesFilter = () => {
  const { totalCount, loading } = useExportHistories(
    useImportExportHistoryVariables(),
  );

  return (
    <ImportExportHistoriesFilter
      id="export-histories-filter"
      sessionKey={EXPORT_HISTORIES_CURSOR_SESSION_KEY}
      totalCount={totalCount}
      loading={loading}
    />
  );
};
