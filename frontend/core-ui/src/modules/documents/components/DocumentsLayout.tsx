import { useSearchParams } from 'react-router-dom';

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
          <Editor key={documentId} />
        ) : (
          <Documents viewType="grid" />
        )}
      </div>
    </div>
  );
};
