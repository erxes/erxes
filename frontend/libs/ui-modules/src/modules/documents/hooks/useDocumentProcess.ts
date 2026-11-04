import { QueryResult, useQuery } from '@apollo/client';
import { PROCESS_DOCUMENT } from '../graphql/queries';

type ProcessDocumentResponse = { documentsProcess: string | null };
type ProcessDocumentVariables = {
  _id: string;
  replacerIds: string[];
  config: { copies: number; width: number; height: number; type: string };
};

export const useDocumentProcess = (
  variables: ProcessDocumentVariables,
): Pick<QueryResult<ProcessDocumentResponse>, 'loading' | 'error'> & {
  content: string | null | undefined;
} => {
  const { data, loading, error } = useQuery<
    ProcessDocumentResponse,
    ProcessDocumentVariables
  >(PROCESS_DOCUMENT, {
    variables,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    skip: !variables._id,
  });
  return {
    content: variables._id ? data?.documentsProcess : undefined,
    loading,
    error,
  };
};
