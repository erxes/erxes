import { formatImportExportEntityTypeLabel } from '@/import-export/shared/formatEntityTypeLabel';
import { useQueryState } from 'erxes-ui';
import { useImportHistoriesRecordTable } from '../components/ImportHistoriesContext';
export const useImportHistoriesRecordTableHeader = () => {
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
      ? '1 import job'
      : `${totalCount.toLocaleString()} import jobs`;

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
    isFilterNotAviable: !typesLoading && typesError,
  };
};
