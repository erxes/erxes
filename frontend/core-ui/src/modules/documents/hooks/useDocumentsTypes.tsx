import { useQuery } from '@apollo/client';
import { GET_DOCUMENTS_TYPES } from '../graphql/queries';
import { IDocumentType } from '../types';

export const useDocumentsTypes = () => {
  const { data, error, loading, refetch } = useQuery<{
    documentsTypes: IDocumentType[];
  }>(GET_DOCUMENTS_TYPES, { notifyOnNetworkStatusChange: true });

  const documentsTypes: IDocumentType[] = data?.documentsTypes || [];

  return {
    documentsTypes,
    refetch,
    error,
    loading,
  };
};
