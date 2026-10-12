import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { useMemo } from 'react';
import { GET_DOCUMENT_EDITOR_ATTRIBUTES } from '../graphql/queries';
import { DocumentAttribute } from '../types';

export const useDocumentAttributes = () => {
  const [contentType] = useQueryState('contentType');

  const { data, error, loading } = useQuery<{
    documentsGetEditorAttributes: DocumentAttribute[];
  }>(GET_DOCUMENT_EDITOR_ATTRIBUTES, {
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
  };
};
