import { QueryResult, useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { useMemo } from 'react';
import { GET_DOCUMENT_EDITOR_ATTRIBUTES } from '../graphql/queries';
import { DocumentAttribute } from '../types';

type DocumentAttributesResponse = {
  documentsGetEditorAttributes: DocumentAttribute[];
};

export const useDocumentAttributes = (
  documentContentType?: string,
): Pick<
  QueryResult<DocumentAttributesResponse>,
  'error' | 'loading' | 'refetch'
> & { attributes: DocumentAttribute[] } => {
  const [queryContentType] = useQueryState<string>('contentType');
  const contentType = documentContentType || queryContentType;

  const { data, error, loading, refetch } =
    useQuery<DocumentAttributesResponse>(GET_DOCUMENT_EDITOR_ATTRIBUTES, {
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
      variables: {
        contentType,
      },
      skip: !contentType,
    });

  const attributes = useMemo(() => {
    const list = data?.documentsGetEditorAttributes || [];
    const seen = new Set<string>();

    return list.filter((attr: DocumentAttribute) => {
      const key = String(attr?.value ?? attr?.name ?? '');

      if (!key || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }, [data]);

  return {
    attributes,
    error,
    loading,
    refetch,
  };
};
