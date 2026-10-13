import { useApolloClient } from '@apollo/client';
import { FormType } from '@/documents/hooks/useDocumentForm';
import { Button, toast, useQueryState } from 'erxes-ui';
import { useCallback } from 'react';
import { SubmitHandler, useFormContext } from 'react-hook-form';
import { ApprovalLockButton } from 'ui-modules';
import { DOCUMENT_APPROVAL_CONTENT_TYPE } from '../constants';
import { GET_DOCUMENTS, GET_DOCUMENT_DETAIL } from '../graphql/queries';
import { useDocument } from '../hooks/useDocument';
import { useTranslation } from 'react-i18next';

export const DocumentSheet = () => {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
  const [documentId, setDocumentId] = useQueryState<string>('documentId');
  const [contentType] = useQueryState<string>('contentType');

  const {
    reset: resetForm,
    setValue,
    handleSubmit,
    formState,
  } = useFormContext<FormType>();

  const client = useApolloClient();
  const { document, documentSave, hasError, loading } = useDocument();
  const cleanDocumentId = documentId?.trim();

  const submitHandler: SubmitHandler<FormType> = useCallback(async () => {
    documentSave();
  }, [documentSave]);

  const hasChanges = formState.isDirty;

  if (!contentType) {
    return null;
  }

  if (!documentId) {
    return (
      <Button
        onClick={() => {
          setDocumentId(' ');
          resetForm();

          setValue('contentType', contentType);
        }}
      >
        {t('add-document')}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {cleanDocumentId && document && !hasError && (
        <ApprovalLockButton
          contentType={DOCUMENT_APPROVAL_CONTENT_TYPE}
          contentId={cleanDocumentId}
          ownerId={document.createdUser?._id}
          action="edit"
          onChanged={() => {
            client
              .refetchQueries({
                include: [
                  GET_DOCUMENTS,
                  GET_DOCUMENT_DETAIL,
                  'ApprovalLockState',
                ],
              })
              .catch(() => {
                toast({
                  title: t('refresh-access-failed'),
                  description: t('refresh-access-failed-description'),
                  variant: 'destructive',
                });
              });
          }}
        />
      )}
      <Button
        onClick={handleSubmit(submitHandler)}
        disabled={!hasChanges || loading || hasError}
      >
        {t('save-document')}
      </Button>
    </div>
  );
};
