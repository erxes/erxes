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

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className="w-(--sidebar-width) flex-none overflow-hidden">
        {contentType && documentId !== null ? (
          <Documents viewType="list" />
        ) : (
          <DocumentsTypes />
        )}
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        {documentId !== null ? (
          documentId.trim() ? (
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
          )
        ) : (
          <Documents viewType="grid" />
        )}
      </div>
    </div>
  );
};
