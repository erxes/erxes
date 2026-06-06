import { formatImportExportEntityTypeLabel } from '@/import-export/shared/formatEntityTypeLabel';
import { useQueryState } from 'erxes-ui';
import { useExportHistoriesRecordTable } from '../components/ExportHistoriesContext';

export const useExportHistoriesRecordTableHeader = () => {
  const [selectedEntityType, setSelectedEntityType] = useQueryState<string>(
    'type',
    {
      defaultValue: 'all',
    },
  ) as [string, (value: string | null) => void];

  const { contentTypes, loading, totalCount, typesLoading, typesError } =
    useExportHistoriesRecordTable();

  const totalLabel =
    totalCount === 1
      ? '1 export job'
      : `${totalCount.toLocaleString()} export jobs`;

  const selectedTypeLabel =
    selectedEntityType === 'all'
      ? 'All types'
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
    isFilterNotAvailable: !typesLoading && typesError,
  };
};
