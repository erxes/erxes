import { BlockEditor, cn, parseBlocks, useBlockEditor } from 'erxes-ui';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  embedBlockStructureInHTML,
  parseBlockStructureFromHTML,
} from '../utils/blockStructureHTML';

interface CmsPostEditorProps {
  className?: string;
  initialContent: string;
  onChange: (value: string) => void;
  uploadFile: (file: File) => Promise<string>;
}

export const CmsPostEditor = ({
  className,
  initialContent,
  onChange,
  uploadFile,
}: CmsPostEditorProps) => {
  const skipNextOnChangeRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEditorOutputRef = useRef('');
  const outputRevisionRef = useRef(0);
  const parsedInitialContent = useMemo(
    () =>
      parseBlockStructureFromHTML(initialContent) ||
      parseBlocks(initialContent) ||
      undefined,
    [initialContent],
  );
  const editor = useBlockEditor({
    initialContent: parsedInitialContent,
    uploadFile,
  });

  useEffect(() => {
    return () => {
      outputRevisionRef.current += 1;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!initialContent || initialContent === lastEditorOutputRef.current) {
      return;
    }

    let isActive = true;

    const syncContent = async () => {
      const structuredBlocks =
        parseBlockStructureFromHTML(initialContent) ||
        parseBlocks(initialContent);
      const blocks =
        structuredBlocks || (await editor.tryParseHTMLToBlocks(initialContent));

      if (!isActive) {
        return;
      }

      const currentSerialized = JSON.stringify(editor.document);
      const nextSerialized = JSON.stringify(blocks);

      if (currentSerialized !== nextSerialized) {
        outputRevisionRef.current += 1;
        skipNextOnChangeRef.current = true;
        editor.replaceBlocks(editor.document, blocks);
      }
    };

    syncContent().catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, [editor, initialContent]);

  const handleChange = useCallback(() => {
    const outputRevision = ++outputRevisionRef.current;

    if (skipNextOnChangeRef.current) {
      skipNextOnChangeRef.current = false;
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const blocks = editor.document;
      const html = await editor.blocksToHTMLLossy(blocks);

      if (outputRevision !== outputRevisionRef.current) {
        return;
      }

      const content = embedBlockStructureInHTML(html, blocks);

      lastEditorOutputRef.current = content;
      onChange(content);
    }, 300);
  }, [editor, onChange]);

  return (
    <BlockEditor
      variant="outline"
      className={cn(
        'min-w-0 w-full overflow-x-hidden overflow-y-auto h-28 rounded-md min-h-28 styled-scroll shadow-xs transition-[color,box-shadow] pt-1',
        className,
      )}
      editor={editor}
      onChange={handleChange}
    />
  );
};
