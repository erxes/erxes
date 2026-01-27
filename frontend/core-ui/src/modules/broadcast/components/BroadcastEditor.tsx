import { BlockEditor, cn, IBlockEditor, useBlockEditor } from 'erxes-ui';
import { useEffect } from 'react';
import { AttributeInEditor, DocumentInEditor } from 'ui-modules';

export const BroadcastEditor = ({
  onChange,
  attribute = false,
  document = false,
}: {
  value: string;
  onChange: (value: string) => void;
  attribute?: boolean;
  document?: boolean;
}) => {
  const editor = useBlockEditor({});

  useEffect(() => {
    const unsubscribe = editor.onChange(async (editor: IBlockEditor) => {
      onChange(JSON.stringify(editor.document));
    });

    return unsubscribe;
  }, [editor, onChange]);

  return (
    <BlockEditor
      editor={editor}
      className={cn('flex-1 w-full overflow-y-auto')}
    >
      {attribute && (
        <AttributeInEditor editor={editor} contentType="core:contact.customer" />
      )}
      {document && <DocumentInEditor editor={editor} contentType="core:contact.customer" />}
    </BlockEditor>
  );
};
