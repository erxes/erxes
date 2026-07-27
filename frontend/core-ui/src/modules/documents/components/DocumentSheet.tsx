import { FormType } from '@/documents/hooks/useDocumentForm';
import { Button, useQueryState } from 'erxes-ui';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SubmitHandler, useFormContext } from 'react-hook-form';
import { useDocument } from '../hooks/useDocument';

export const DocumentSheet = () => {
  const { t } = useTranslation('documents');
  const [documentId, setDocumentId] = useQueryState('documentId');
  const [contentType] = useQueryState<string>('contentType');

  const {
    reset: resetForm,
    setValue,
    handleSubmit,
    formState,
  } = useFormContext<FormType>();

  const { documentSave } = useDocument();

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
        {t('add-document-btn', 'Add Document')}
      </Button>
    );
  }

  return (
    <Button onClick={handleSubmit(submitHandler)} disabled={!hasChanges}>
      {t('save-document', 'Save Document')}
    </Button>
  );
};
