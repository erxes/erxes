import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { toast, useConfirm, useMultiQueryState } from 'erxes-ui';
import { useState } from 'react';
import { DOCUMENTS_QUERY } from 'ui-modules';
import { DUPLICATE_DOCUMENT } from '../graphql/documentMutations';
import { GET_DOCUMENTS } from '../graphql/queries';
import { IDocument } from '../types';
import { useDocumentRemove } from './useDocumentRemove';

type DocumentActions = {
  open: boolean;
  setOpen: (open: boolean) => void;
  printOpen: boolean;
  setPrintOpen: (open: boolean) => void;
  duplicateOpen: boolean;
  setDuplicateOpen: (open: boolean) => void;
  loading: boolean;
  duplicating: boolean;
  handleEdit: () => void;
  handlePrint: () => void;
  handleOpenDuplicate: () => void;
  handleDuplicate: (contentType: string) => Promise<void>;
  handleDelete: () => void;
};

export const useDocumentActions = (document: IDocument): DocumentActions => {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
  const [open, setOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [, setQueries] = useMultiQueryState<{
    documentId: string;
    contentType: string;
  }>(['documentId', 'contentType']);
  const [duplicateDocument, { loading: duplicating }] = useMutation<
    { documentsDuplicate: IDocument | null },
    { _id: string; contentType: string }
  >(DUPLICATE_DOCUMENT);
  const { confirm } = useConfirm();
  const { removeDocument, loading } = useDocumentRemove();

  const handleEdit = (): void => {
    setOpen(false);
    setQueries({ documentId: document._id, contentType: document.contentType });
  };
  const handlePrint = (): void => {
    setOpen(false);
    setPrintOpen(true);
  };
  const handleOpenDuplicate = (): void => {
    setOpen(false);
    setDuplicateOpen(true);
  };
  const handleDuplicate = async (contentType: string): Promise<void> => {
    try {
      const { data } = await duplicateDocument({
        variables: { _id: document._id, contentType },
        refetchQueries: [GET_DOCUMENTS, DOCUMENTS_QUERY],
        awaitRefetchQueries: true,
      });
      if (!data?.documentsDuplicate) {
        throw new Error('The server did not return a duplicated document');
      }
      setDuplicateOpen(false);
      setQueries({ documentId: data.documentsDuplicate._id, contentType });
      toast({ title: t('duplicated-success'), variant: 'success' });
    } catch (error) {
      toast({
        title: t('duplicate-error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    }
  };
  const handleDelete = (): void => {
    setOpen(false);
    void confirm({
      message: t('delete-title', { name: document.name || t('untitled') }),
      options: {
        description: t('delete-description'),
        okLabel: t('delete-document'),
      },
    })
      .then(() => removeDocument({ variables: { id: document._id } }))
      .catch(() => undefined);
  };

  return {
    open,
    setOpen,
    printOpen,
    setPrintOpen,
    duplicateOpen,
    setDuplicateOpen,
    loading,
    duplicating,
    handleEdit,
    handlePrint,
    handleOpenDuplicate,
    handleDuplicate,
    handleDelete,
  };
};
