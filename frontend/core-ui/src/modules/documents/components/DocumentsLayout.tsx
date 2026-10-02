import { Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { ApprovalLockGuard } from 'ui-modules';
import { DOCUMENT_APPROVAL_CONTENT_TYPE } from '../constants';
import { DocumentEditorSkeleton } from './DocumentEditorSkeleton';

export const DocumentsLayout = ({
  Documents,
  DocumentsTypes,
  Editor,
}: {
  Documents: React.ComponentType<{ viewType: 'list' | 'grid' }>;
  DocumentsTypes: React.ComponentType;
  Editor: React.ComponentType;
}) => {
  const [searchParams] = useSearchParams();

  const documentId = searchParams.get('documentId');
  const contentType = searchParams.get('contentType');
  const showDocumentList = Boolean(contentType && documentId !== null);
  const { t } = useTranslation('documents');

  const editor = documentId?.trim() ? (
    <ApprovalLockGuard
      key={documentId}
      contentType={DOCUMENT_APPROVAL_CONTENT_TYPE}
      contentId={documentId.trim()}
      action="view"
      loadingFallback={<DocumentEditorSkeleton />}
    >
      <Editor key={documentId} />
    </ApprovalLockGuard>
  ) : (
    <Editor key={documentId} />
  );

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <Sidebar.Panel
        className="flex-none border-r bg-muted/20"
        label={showDocumentList ? undefined : t('documents')}
      >
        {showDocumentList ? <Documents viewType="list" /> : <DocumentsTypes />}
      </Sidebar.Panel>
      <div className="min-w-0 flex-1 overflow-hidden">
        {documentId !== null ? editor : <Documents viewType="grid" />}
      </div>
    </div>
  );
};
