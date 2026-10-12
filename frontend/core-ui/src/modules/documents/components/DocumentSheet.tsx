import { useApolloClient } from '@apollo/client';
import { FormType } from '@/documents/hooks/useDocumentForm';
import { Button, toast, useMultiQueryState } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { SubmitHandler, useFormContext } from 'react-hook-form';
import { ApprovalLockButton } from 'ui-modules';
import { DOCUMENT_APPROVAL_CONTENT_TYPE } from '../constants';
import { GET_DOCUMENTS, GET_DOCUMENT_DETAIL } from '../graphql/queries';
import { useDocument } from '../hooks/useDocument';
import { DocumentTypeDialog } from './DocumentTypeDialog';

export const DocumentSheet = () => {
  const [{ documentId, contentType }, setQueries] = useMultiQueryState<{
    documentId: string;
    contentType: string;
  }>(['documentId', 'contentType']);
  const [typeOpen, setTypeOpen] = useState(false);

  const {
    reset: resetForm,
    setValue,
    handleSubmit,
    formState,
  } = useFormContext<FormType>();

  const client = useApolloClient();
  const { document, documentSave, hasError, loading, saving } = useDocument();
  const cleanDocumentId = documentId?.trim();

  const submitHandler: SubmitHandler<FormType> = useCallback(async () => {
    await documentSave();
  }, [documentSave]);

  const hasChanges = formState.isDirty;

  const createDocument = (nextType: string) => {
    resetForm({ name: '', content: '', contentType: nextType });
    setValue('contentType', nextType);
    setQueries({ documentId: ' ', contentType: nextType });
    setTypeOpen(false);
  };

  if (!documentId) {
    return (
      <>
        <Button
          type="button"
          onClick={() =>
            contentType ? createDocument(contentType) : setTypeOpen(true)
          }
        >
          Add Document
        </Button>
        {typeOpen && (
          <DocumentTypeDialog
            open={typeOpen}
            onOpenChange={setTypeOpen}
            onSelect={createDocument}
          />
        )}
      </>
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
                  title: 'Could not refresh document access',
                  description:
                    'Reload the page to see the latest access state.',
                  variant: 'destructive',
                });
              });
          }}
        />
      )}
      <Button
        onClick={handleSubmit(submitHandler, (errors) => {
          toast({
            title: 'Check the document',
            description:
              Object.values(errors)[0]?.message ||
              'Name and content are required.',
            variant: 'destructive',
          });
        })}
        type="button"
        disabled={!hasChanges || loading || hasError || saving}
      >
        {saving ? 'Saving…' : 'Save Document'}
      </Button>
    </div>
  );
};
