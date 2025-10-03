import { BlockEditor, useBlockEditor } from 'erxes-ui';
import { useEffect } from 'react';

export const DocumentPreview = ({ document }: any) => {
  const editor = useBlockEditor();

  useEffect(() => {
    const loadInitialContent = async () => {
      let blocks;

      try {
        blocks = JSON.parse(document.content);
      } catch (_error) {
        blocks = await editor.tryParseHTMLToBlocks(document.content);
      }

      editor.replaceBlocks(editor.document, blocks);
    };

    loadInitialContent();
  }, [document._id, editor]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="scale-[0.3] origin-top-left w-[333%] h-auto pointer-events-none select-none">
        <BlockEditor editor={editor} readonly className="py-8 px-4" />
      </div>
    </div>
  );
};
