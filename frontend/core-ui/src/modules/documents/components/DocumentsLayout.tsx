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
    <Resizable.PanelGroup
      direction="horizontal"
      className="flex-1 overflow-hidden"
    >
      <Resizable.Panel minSize={20} maxSize={25} defaultSize={20}>
        {contentType && documentId !== null ? (
          <Documents viewType={'list'} />
        ) : (
          <DocumentsTypes />
        )}
      </Resizable.Panel>
      <Resizable.Handle />
      <Resizable.Panel defaultSize={75}>
        {documentId !== null ? <Editor /> : <Documents viewType={'grid'} />}
      </Resizable.Panel>
    </Resizable.PanelGroup>
  );
};
