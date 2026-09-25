import { useQuery } from '@apollo/client';
import { IMPORT_FIELDS } from '../../graphql/import/importsQueries';
import { TImportPreviewField } from '../../types/import/importTypes';

type ImportFieldsResponse = {
  importFields: TImportPreviewField[];
};

export const useImportFields = (entityType: string) => {
  const { data, loading, error } = useQuery<ImportFieldsResponse>(
    IMPORT_FIELDS,
    { variables: { entityType } },
  );

  const fields = data?.importFields || [];

  return {
    fields,
    systemFields: fields.filter((field) => field.type !== 'customProperty'),
    customFields: fields.filter((field) => field.type === 'customProperty'),
    loading,
    error,
  };
};
