import { useQuery } from '@apollo/client';
import { GET_DOCUMENTS_TYPES } from '../graphql/queries';
import { IDocumentType } from '../types';

export const useDocumentsTypes = () => {
  const { data, error, loading } = useQuery(GET_DOCUMENTS_TYPES);

  const documentsTypes: IDocumentType[] = data?.documentsTypes || [];

  return {
    documentsTypes,
    error,
    loading,
  };
};
