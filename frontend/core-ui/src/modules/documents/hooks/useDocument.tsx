import { NetworkStatus, useMutation, useQuery } from '@apollo/client';
import { toast, useMultiQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { SAVE_DOCUMENT } from '../graphql/documentMutations';
import { GET_DOCUMENTS, GET_DOCUMENT_DETAIL } from '../graphql/queries';
import { IDocument } from '../types';
import { FormType } from './useDocumentForm';
import { DOCUMENTS_QUERY } from 'ui-modules';

export const useDocument = () => {
  const [{ documentId }, setQueries] = useMultiQueryState<{
    documentId: string;
    contentType: string;
  }>(['documentId', 'contentType']);
  const cleanDocumentId = documentId?.trim();
  const { getValues, reset } = useFormContext<FormType>();
  const { data, error, loading, networkStatus, refetch } = useQuery<{
    documentsDetail: IDocument | null;
  }>(GET_DOCUMENT_DETAIL, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    variables: { _id: cleanDocumentId },
    skip: !cleanDocumentId,
  });
  const document = data?.documentsDetail || null;
  const hasError = Boolean(error || networkStatus === NetworkStatus.error);

  useEffect(() => {
    if (document) {
      reset({
        name: document.name || '',
        content: document.content || '',
        contentType: document.contentType,
        commentState: document.commentState || undefined,
      });
    }
  }, [document, reset]);

  const [saveDocument, { loading: saving }] = useMutation<{
    documentsSave: IDocument;
  }>(SAVE_DOCUMENT);

  const documentSave = async (): Promise<void> => {
    try {
      const values = getValues();
      const { data: saved } = await saveDocument({
        variables: { ...values, _id: cleanDocumentId || undefined },
        refetchQueries: [GET_DOCUMENTS, DOCUMENTS_QUERY],
        awaitRefetchQueries: true,
      });
      if (saved?.documentsSave) {
        reset(values);
        setQueries({
          documentId: saved.documentsSave._id,
          contentType: saved.documentsSave.contentType,
        });
        toast({ title: 'Successfully saved document', variant: 'success' });
      }
    } catch (error) {
      toast({
        title: 'Could not save document',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    }
  };

  return {
    document,
    documentId: cleanDocumentId,
    documentSave,
    hasError,
    loading,
    refetch,
    saving,
  };
};
