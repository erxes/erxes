import { useApolloClient } from '@apollo/client';
import { FormType } from '@/documents/hooks/useDocumentForm';
import { Button, toast, useMultiQueryState } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { DocumentTypeDialog } from './DocumentTypeDialog';
import { SubmitHandler, useFormContext } from 'react-hook-form';
import { ApprovalLockButton } from 'ui-modules';
import { DOCUMENT_APPROVAL_CONTENT_TYPE } from '../constants';
import { GET_DOCUMENTS, GET_DOCUMENT_DETAIL } from '../graphql/queries';
import { useDocument } from '../hooks/useDocument';
import { useDocumentNavigation } from '../hooks/useDocumentNavigation';

export const DocumentSheet = () => {
  const [{ documentId, contentType }] = useMultiQueryState<{
    contentType: string;
    documentId: string;
  }>(['contentType', 'documentId']);
  const { openDocument } = useDocumentNavigation();
  const [typeOpen, setTypeOpen] = useState(false);

  const {
    reset: resetForm,
    handleSubmit,
    formState,
  } = useFormContext<FormType>();

  const client = useApolloClient();
  const { document, documentSave, hasError, loading, saving } = useDocument();
  const cleanDocumentId = documentId?.trim();

  const submitHandler: SubmitHandler<FormType> = useCallback(async () => {
    documentSave();
  }, [documentSave]);

  const hasChanges = formState.isDirty;

  /** Reset the form before opening a new template with its selected type. */
  const createDocument = (nextType: string): boolean => {
    resetForm({
      name: '',
      content: '',
      contentType: nextType,
      commentData: '',
    });
    openDocument({ contentType: nextType, _id: ' ' });
    return true;
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
            open
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
        onClick={handleSubmit(submitHandler)}
        disabled={!hasChanges || loading || saving || hasError}
      >
        Save Document
      </Button>
    </div>
  );
};
