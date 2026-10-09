import {
  NetworkStatus,
  QueryResult,
  useMutation,
  useQuery,
} from '@apollo/client';
import { toast, useQueryState } from 'erxes-ui';
import { useEffect, useRef } from 'react';
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

  const hydratedDocumentId = useRef<string>();
  const document =
    data?.documentsDetail && data.documentsDetail._id === cleanDocumentId
      ? data.documentsDetail
      : null;
  const hasError = Boolean(error || networkStatus === NetworkStatus.error);

  useEffect(() => {
    if (document && hydratedDocumentId.current !== document._id) {
      const fields = document;

      setValue('name', fields.name || '');
      setValue('content', fields.content || '');
      setValue('contentType', fields.contentType);
      setValue('commentData', fields.commentData || '');
      hydratedDocumentId.current = fields._id;
    }
  }, [document, setValue]);

  const [saveDocument, { loading: saving }] = useMutation<{
    documentsSave: IDocument | null;
  }>(SAVE_DOCUMENT);

  const documentSave = () => {
    const document: FormType & { _id?: string } = {
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
      refetchQueries: [GET_DOCUMENTS],
      awaitRefetchQueries: true,
      onCompleted: (data) => {
        const savedDocument = data.documentsSave;
        if (savedDocument) {
          const hasNewEdits = (
            ['name', 'content', 'contentType', 'commentData'] as const
          ).some((field) => getValues(field) !== document[field]);
          reset(
            document,
            hasNewEdits ? { keepValues: true, keepDirty: true } : undefined,
          );
          if (!cleanDocumentId) {
            setTimeout(() => {
              setDocumentId(savedDocument._id);
            }, 0);
          }

          toast({ title: 'Successfully saved document', variant: 'success' });
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
