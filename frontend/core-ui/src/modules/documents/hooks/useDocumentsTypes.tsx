import { QueryResult, useQuery } from '@apollo/client';
import { GET_DOCUMENTS_TYPES } from '../graphql/queries';
import { IDocumentType } from '../types';

type DocumentTypesResponse = { documentsTypes: IDocumentType[] };

export const useDocumentsTypes = (): Pick<
  QueryResult<DocumentTypesResponse>,
  'loading' | 'error' | 'refetch'
> & { documentsTypes: IDocumentType[] } => {
  const { data, error, loading, refetch } =
    useQuery<DocumentTypesResponse>(GET_DOCUMENTS_TYPES);

  const documentsTypes: IDocumentType[] = data?.documentsTypes || [];

  return {
    documentsTypes,
    error,
    loading,
    refetch,
  };
};
