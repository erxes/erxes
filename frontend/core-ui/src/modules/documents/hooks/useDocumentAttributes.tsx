import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { GET_DOCUMENT_EDITOR_ATTRIBUTES } from '../graphql/queries';

export const useDocumentAttributes = () => {
  const [contentType] = useQueryState('contentType');

  const { data, error, loading } = useQuery(GET_DOCUMENT_EDITOR_ATTRIBUTES, {
    variables: {
      contentType,
    },
    skip: !contentType,
  });

  const attributes = data?.documentsGetEditorAttributes || [];

  return {
    attributes,
    error,
    loading,
  };
};
