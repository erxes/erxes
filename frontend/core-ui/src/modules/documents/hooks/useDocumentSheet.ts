import { useTranslation } from 'react-i18next';
import { toast, useMultiQueryState } from 'erxes-ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDocument } from './useDocument';
import { useDocumentAccessRefresh } from './useDocumentAccessRefresh';
import { FormType } from './useDocumentForm';

type DocumentSheetState = Pick<
  ReturnType<typeof useDocument>,
  'document' | 'loading' | 'hasError' | 'saving'
> & {
  documentId: string | null;
  cleanDocumentId: string | undefined;
  typeOpen: boolean;
  setTypeOpen: (open: boolean) => void;
  createDocument: (contentType: string) => void;
  handleAdd: () => void;
  handleSave: () => Promise<void>;
  refreshAccess: () => Promise<void>;
  canSave: boolean;
};

export const useDocumentSheet = (): DocumentSheetState => {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
  const [{ documentId, contentType }, setQueries] = useMultiQueryState<{
    documentId: string;
    contentType: string;
  }>(['documentId', 'contentType']);
  const [typeOpen, setTypeOpen] = useState(false);
  const { reset, handleSubmit, formState } = useFormContext<FormType>();
  const { document, documentSave, hasError, loading, saving } = useDocument();
  const refreshAccess = useDocumentAccessRefresh();
  const createDocument = (nextType: string): void => {
    reset({ name: '', content: '', contentType: nextType });
    setQueries({ documentId: ' ', contentType: nextType });
    setTypeOpen(false);
  };
  const handleAdd = (): void => {
    if (contentType) createDocument(contentType);
    else setTypeOpen(true);
  };
  const handleSave = handleSubmit(documentSave, (errors) => {
    toast({
      title: t('check-document'),
      description:
        Object.values(errors)[0]?.message || t('required-name-content'),
      variant: 'destructive',
    });
  });

  return {
    documentId,
    cleanDocumentId: documentId?.trim(),
    document,
    loading,
    hasError,
    saving,
    typeOpen,
    setTypeOpen,
    createDocument,
    handleAdd,
    handleSave,
    refreshAccess,
    canSave: formState.isDirty && !loading && !hasError && !saving,
  };
};
