import { BlockEditor, useBlockEditor } from 'erxes-ui';
import { useEffect } from 'react';
import { MembersInline } from 'ui-modules';

export const BroadcastTabPreviewEmailContent = ({
  message,
}: {
  message: any;
}) => {
  const { fromUserId, email } = message || {};
  const { sender, subject, content } = email || {};
  const editor = useBlockEditor();

  useEffect(() => {
    const loadInitialContent = async () => {
      let blocks;

      try {
        blocks = JSON.parse(content);
      } catch (_error) {
        blocks = await editor.tryParseHTMLToBlocks(content);
      }

      editor.replaceBlocks(editor.document, blocks);
    };

    loadInitialContent();
  }, [content, editor]);

  return (
    <div className="flex flex-col gap-8 h-full overflow-hidden">
      <div className="px-9 py-5 border rounded-md bg-muted space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Subject:</span>{' '}
          <h3 className="line-clamp-1">{subject} </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">From:</span>
          <MembersInline memberIds={[fromUserId]} className="font-semibold" />
          {sender && (
            <>
              <span className="text-sm text-muted-foreground">as</span>
              <span className="font-semibold">{sender}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-y-auto">
        <BlockEditor
          editor={editor}
          readonly
          className="select-none h-full w-full"
        />
      </div>
    </div>
  );
};
