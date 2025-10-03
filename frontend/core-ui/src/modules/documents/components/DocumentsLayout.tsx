import { Resizable } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';

export const DocumentsLayout = ({
  Documents,
  DocumentsTypes,
  Editor,
}: {
  Documents: React.ComponentType<any>;
  DocumentsTypes: React.ComponentType<any>;
  Editor: React.ComponentType<any>;
}) => {
  const [searchParams] = useSearchParams();

  const documentId = searchParams.get('documentId');
  const contentType = searchParams.get('contentType');

  return (
    <div className="flex flex-auto overflow-hidden">
      {contentType && documentId !== null ? (
        <Documents viewType={'list'} showFilter={false} />
      ) : (
        <DocumentsTypes />
      )}
      <div className="flex-1">
        {documentId !== null ? <Editor /> : <Documents viewType={'grid'} />}
      </div>
    </div>
  );
};
