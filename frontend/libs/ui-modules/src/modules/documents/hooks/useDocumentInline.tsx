import { QueryHookOptions, useQuery } from '@apollo/client';
import { DOCUMENT_DETAIL } from '../graphql/queries';

export interface IDocumentInline {
  _id: string;
  name: string;
}

export interface IDocumentInlineQuery {
  documentsDetail: IDocumentInline;
}

export const useDocumentInline = (
  options?: QueryHookOptions<IDocumentInlineQuery>,
) => {
  const { data, loading, error } = useQuery<IDocumentInlineQuery>(
    DOCUMENT_DETAIL,
    {
      ...options,
    },
  );

  return {
    document: data?.documentsDetail,
    loading,
    error,
  };
};
