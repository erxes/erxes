import { useMutation, useQuery } from '@apollo/client';
import { toast, useQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { SAVE_DOCUMENT } from '../graphql/documentMutations';
import { GET_DOCUMENT_DETAIL } from '../graphql/queries';

export const useDocument = () => {
  const [documentId, setDocumentId] = useQueryState('documentId');
  const [contentType] = useQueryState('contentType');

  const cleanDocumentId = (documentId as string)?.trim();

  const { getValues, setValue } = useFormContext();

  const { data, loading } = useQuery(GET_DOCUMENT_DETAIL, {
    variables: {
      _id: cleanDocumentId,
    },
    skip: !cleanDocumentId,
  });

  const document = data?.documentsDetail || {};

  useEffect(() => {
    if (data?.documentsDetail) {
      const fields = data.documentsDetail;

      Object.entries(fields).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [data, setValue]);

  const [saveDocument, { loading: saving }] = useMutation(SAVE_DOCUMENT);

  const documentSave = () => {
    const document: any = {
      name: getValues('name'),
      content: getValues('content'),
      contentType,
    };

    if (cleanDocumentId) {
      document._id = cleanDocumentId;
    }

    saveDocument({
      variables: { ...document },
      update: (cache, { data: { documentsSave } }) => {
        const docId = cache.identify(documentsSave);

        if (cleanDocumentId) {
          return cache.modify({
            id: docId,
            fields: Object.keys(document || {}).reduce((fields: any, field) => {
              fields[field] = () => (document || {})[field];
              return fields;
            }, {}),
          });
        }

        cache.modify({
          fields: {
            documents(existingDocs) {
              const { list = [] } = existingDocs || {};

              return [...list, documentsSave];
            },
          },
        });
      },
      onCompleted: (data) => {
        if (data.documentsSave) {
          if (!cleanDocumentId) {
            setTimeout(() => {
              setDocumentId(data.documentsSave._id);
            }, 0);
          }

          toast({ title: 'Successfully saved document' });
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
    documentSave,
    loading,
    saving,
  };
};
