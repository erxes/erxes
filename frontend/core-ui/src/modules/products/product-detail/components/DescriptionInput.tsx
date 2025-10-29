import {
  IconArrowUp,
  IconCommand,
  IconCornerDownLeft,
} from '@tabler/icons-react';
import { BlockEditor, Button, cn, useBlockEditor } from 'erxes-ui';
import { Kbd } from 'erxes-ui';
import { useCallback, useEffect } from 'react';
import { DescriptionInputProps } from '../types/descriptionTypes';

export const DescriptionInput = ({
  initialContent,
  onSave,
}: DescriptionInputProps) => {
  const editor = useBlockEditor();

  useEffect(() => {
    async function loadInitialContent() {
      if (initialContent) {
        try {
          const blocks = await editor.tryParseHTMLToBlocks(initialContent);
          editor.replaceBlocks(editor.document, blocks);
        } catch {
          // try {
          //   const parsedContent = JSON.parse(initialContent) as Block[];
          //   editor.replaceBlocks(editor.document, parsedContent);
          // } catch (error) {
          //   console.warn('Parsing failed for both Markdown and JSON:', error);
          //   const fallbackBlock: Block[] = [
          //     {
          //       id: 'initial-block',
          //       type: 'paragraph',
          //       content: initialContent || '',
          //       children: [],
          //     },
          //   ];
          //   editor.replaceBlocks(editor.document, fallbackBlock);
          // }
        }
      }
    }

    loadInitialContent();
  }, [initialContent, editor]);

  const handleSave = useCallback(async () => {
    if (onSave) {
      const html = await editor.blocksToHTMLLossy(editor.document);
      onSave(html);
    }
  }, [onSave, editor.document]);
  // use
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleSave]);

  return (
    <div className={cn('flex flex-col h-full py-4 gap-1')}>
      <BlockEditor
        editor={editor}
        className={cn('h-full w-full overflow-y-auto')}
      />
      <div className="flex px-6 gap-4">
        <Button size="lg" className="ml-auto" onClick={handleSave}>
          <IconArrowUp />
          Send
          <Kbd className="ml-1">
            <IconCommand size={12} />
            <IconCornerDownLeft size={12} />
          </Kbd>
        </Button>
      </div>
    </div>
  );
};
