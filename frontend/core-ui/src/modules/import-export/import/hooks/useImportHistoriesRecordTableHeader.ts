import { formatImportExportEntityTypeLabel } from '@/import-export/shared/formatEntityTypeLabel';
import { useQueryState } from 'erxes-ui';
import { useImportHistoriesRecordTable } from '../components/ImportHistoriesContext';
import { useTranslation } from 'react-i18next';
export const useImportHistoriesRecordTableHeader = () => {
  const { t } = useTranslation('import-export');
  const [selectedEntityType, setSelectedEntityType] = useQueryState<string>(
    'type',
    {
      defaultValue: 'all',
    },
  ) as [string, (value: string | null) => void];

  const { contentTypes, loading, totalCount, typesLoading, typesError } =
    useImportHistoriesRecordTable();

  const totalLabel =
    totalCount === 1
      ? t('import-job-one', '1 import job')
      : `${totalCount.toLocaleString()} ${t('import-jobs', 'import jobs')}`;

  const selectedTypeLabel =
    selectedEntityType === 'all'
      ? t('all-types', 'All types')
      : formatImportExportEntityTypeLabel(
          selectedEntityType || 'all',
          contentTypes,
        );

  return {
    selectedEntityType,
    setSelectedEntityType,
    contentTypes,
    typesLoading,
    typesError,
    totalLabel,
    selectedTypeLabel,
    isLoadingTotalCount: loading && !totalCount,
    hasContentTypes: !!contentTypes.length,
    isFilterNotAviable: !typesLoading && typesError,
  };
};
