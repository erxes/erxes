import { useApolloClient, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useState } from 'react';
import { SAVE_DOCUMENT } from '../graphql/documentMutations';
import { GET_DOCUMENTS, GET_DOCUMENT_DETAIL } from '../graphql/queries';
import { IDocument } from '../types';

export const useDocumentDuplicate = (): {
  duplicateDocument: (id: string, contentType: string) => Promise<boolean>;
  loading: boolean;
} => {
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [saveDocument] = useMutation<{ documentsSave: IDocument | null }>(
    SAVE_DOCUMENT,
  );

  const duplicateDocument = async (
    id: string,
    contentType: string,
  ): Promise<boolean> => {
    if (loading) return false;

    setLoading(true);

    try {
      const { data } = await client.query<{
        documentsDetail: IDocument | null;
      }>({
        query: GET_DOCUMENT_DETAIL,
        variables: { _id: id },
        fetchPolicy: 'network-only',
      });
      const document = data.documentsDetail;

      if (!document) throw new Error('Document not found');

      const { data: saved } = await saveDocument({
        variables: {
          name: `${document.name || 'Untitled'} (copy)`,
          content: document.content,
          contentType,
          subType:
            contentType === document.contentType ? document.subType : null,
          replacer:
            contentType === document.contentType ? document.replacer : null,
          code: document.code,
          tagIds: document.tagIds,
        },
        refetchQueries: [GET_DOCUMENTS],
        awaitRefetchQueries: true,
      });
      if (!saved?.documentsSave)
        throw new Error('Could not create the document copy');

      toast({ title: 'Document duplicated successfully', variant: 'success' });
      return true;
    } catch (error) {
      toast({
        title: 'Could not duplicate document',
        description:
          error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { duplicateDocument, loading };
};
