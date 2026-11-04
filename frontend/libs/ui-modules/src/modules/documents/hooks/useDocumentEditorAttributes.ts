import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { ATTRIBUTE_QUERY } from '../graphql/queries';

export interface DocumentEditorAttribute {
  label?: string;
  name: string;
  value?: string;
  groupDetail?: { name: string };
}

export const useDocumentEditorAttributes = (options: {
  contentType?: string;
  attributes?: DocumentEditorAttribute[];
  loading?: boolean;
}): { attributes: DocumentEditorAttribute[]; loading: boolean } => {
  const [queryContentType] = useQueryState('contentType');
  const contentType = options.contentType || queryContentType;
  const shouldQuery =
    !!contentType && options.attributes === undefined && !options.loading;
  const { data, loading } = useQuery<{
    fieldsCombinedByContentType: DocumentEditorAttribute[];
  }>(ATTRIBUTE_QUERY, {
    variables: { contentType },
    skip: !shouldQuery,
  });
  return {
    attributes:
      options.attributes ??
      (shouldQuery ? data?.fieldsCombinedByContentType : undefined) ??
      [],
    loading: !!options.loading || (shouldQuery && loading),
  };
};
