import { BlockEditor, cn, useBlockEditor } from 'erxes-ui';
import { AttributeInEditor, DocumentInEditor } from 'ui-modules';

export const BroadcastEditor = ({
  attribute = false,
  document = false,
}: {
  attribute?: boolean;
  document?: boolean;
}) => {
  const editor = useBlockEditor({});

  return (
    <BlockEditor
      editor={editor}
      className={cn('flex-1 w-full overflow-y-auto')}
    >
      {attribute && <AttributeInEditor editor={editor} />}
      {document && <DocumentInEditor editor={editor} />}
    </BlockEditor>
  );
};
