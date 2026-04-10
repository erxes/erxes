import { useQuery } from '@apollo/client';
import { GET_IMPORT_EXPORT_TYPES } from '~/modules/import-export/graphql/importExportQueries';

export type TImportExportOperation = 'IMPORT' | 'EXPORT';

export type TImportExportHistoryType = {
  label: string;
  contentType: string;
};

type ImportExportTypesQueryResponse = {
  importExportTypes: TImportExportHistoryType[];
};

export function useImportExportTypes({
  operation,
}: {
  operation: TImportExportOperation;
}) {
  const { data, loading, error } = useQuery<ImportExportTypesQueryResponse>(
    GET_IMPORT_EXPORT_TYPES,
    {
      variables: { operation },
    },
  );

  const importExportTypes = data?.importExportTypes || [];

  return {
    importExportTypes,
    loading,
    error,
  };
}
