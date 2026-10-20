import { Button } from 'erxes-ui';
import { ApprovalLockButton } from 'ui-modules';
import { DOCUMENT_APPROVAL_CONTENT_TYPE } from '../constants';
import { useDocumentSheet } from '../hooks/useDocumentSheet';
import { DocumentTypeDialog } from './DocumentTypeDialog';

export const DocumentSheet = () => {
  const {
    documentId,
    cleanDocumentId,
    document,
    hasError,
    saving,
    typeOpen,
    setTypeOpen,
    createDocument,
    handleAdd,
    handleSave,
    refreshAccess,
    canSave,
  } = useDocumentSheet();
  if (!documentId) {
    return (
      <>
        <Button type="button" onClick={handleAdd}>
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
          onChanged={refreshAccess}
        />
      )}
      <Button onClick={handleSave} type="button" disabled={!canSave}>
        {saving ? 'Saving…' : 'Save Document'}
      </Button>
    </div>
  );
};
