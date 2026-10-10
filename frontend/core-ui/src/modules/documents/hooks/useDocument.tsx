import {
  NetworkStatus,
  QueryResult,
  useMutation,
  useQuery,
} from '@apollo/client';
import { toast, useQueryState } from 'erxes-ui';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormType } from './useDocumentForm';
import { IDocument } from '../types';
import { SAVE_DOCUMENT } from '../graphql/documentMutations';
import { GET_DOCUMENTS, GET_DOCUMENT_DETAIL } from '../graphql/queries';

/** Load and save the selected document while keeping its form and list current. */
export const useDocument = (): {
  document: IDocument | null;
  documentId: string | undefined;
  documentSave: () => void;
  hasError: boolean;
  loading: boolean;
  refetch: QueryResult<{ documentsDetail: IDocument | null }>['refetch'];
  saving: boolean;
} => {
  const [documentId, setDocumentId] = useQueryState<string>('documentId');
  const [contentType] = useQueryState<string>('contentType');

  const cleanDocumentId = documentId?.trim();
  const currentDocument = useRef({ documentId, contentType });
  useLayoutEffect(() => {
    currentDocument.current = { documentId, contentType };
    return () => {
      currentDocument.current = { documentId: null, contentType: null };
    };
  }, [documentId, contentType]);

  const { getValues, setValue, reset } = useFormContext<FormType>();

  const { data, error, loading, networkStatus, refetch } = useQuery<{
    documentsDetail: IDocument | null;
  }>(GET_DOCUMENT_DETAIL, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    variables: {
      _id: cleanDocumentId,
    },
    skip: !cleanDocumentId,
  });

  const document =
    data?.documentsDetail && data.documentsDetail._id === cleanDocumentId
      ? data.documentsDetail
      : null;
  const hasError = Boolean(error || networkStatus === NetworkStatus.error);

  useEffect(() => {
    if (document && getValues('_id') !== document._id) {
      const fields = document;

      setValue('name', fields.name || '');
      setValue('content', fields.content || '');
      setValue('contentType', fields.contentType);
      setValue('commentData', fields.commentData || '');
      setValue('_id', fields._id);
    }
  }, [document, getValues, setValue]);

  const [saveDocument, { loading: saving }] = useMutation<{
    documentsSave: IDocument | null;
  }>(SAVE_DOCUMENT);

  const documentSave = () => {
    const isCurrentDocument = () =>
      currentDocument.current.documentId === documentId &&
      currentDocument.current.contentType === contentType;
    const document: FormType = {
      name: getValues('name'),
      content: getValues('content'),
      contentType: contentType || getValues('contentType'),
      commentData: getValues('commentData'),
    };

    if (cleanDocumentId) {
      document._id = cleanDocumentId;
    }

    saveDocument({
      variables: { ...document },
      update: (cache, { data }) => {
        if (data?.documentsSave) {
          cache.evict({ fieldName: 'documents' });
        }
      },
      refetchQueries: [GET_DOCUMENTS],
      awaitRefetchQueries: true,
      onCompleted: (data) => {
        const savedDocument = data.documentsSave;
        if (savedDocument) {
          if (!isCurrentDocument()) return;
          toast({ title: 'Successfully saved document', variant: 'success' });
          const hasNewEdits = (
            ['name', 'content', 'contentType', 'commentData'] as const
          ).some((field) => getValues(field) !== document[field]);
          reset(
            { ...document, _id: savedDocument._id },
            hasNewEdits ? { keepValues: true, keepDirty: true } : undefined,
          );
          setValue('_id', savedDocument._id);
          if (!cleanDocumentId) {
            setTimeout(() => {
              if (isCurrentDocument()) setDocumentId(savedDocument._id);
            }, 0);
          }
        } else {
          toast({ title: 'Could not save document', variant: 'destructive' });
        }
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error?.message,
          variant: 'destructive',
        });
      },
    });
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
