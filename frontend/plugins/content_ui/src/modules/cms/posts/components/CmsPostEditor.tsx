import { BlockEditor, cn, parseBlocks, useBlockEditor } from 'erxes-ui';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  embedBlockStructureInHTML,
  parseBlockStructureFromHTML,
} from '../utils/blockStructureHTML';
import { registerCmsEditorFlush } from '../utils/editorFlush';

interface CmsPostEditorProps {
  className?: string;
  initialContent: string;
  onChange: (value: string) => void;
  uploadFile: (file: File) => Promise<string>;
}

/** Edits CMS post HTML while preserving the lossless BlockNote document. */
export const CmsPostEditor = ({
  className,
  initialContent,
  onChange,
  uploadFile,
}: CmsPostEditorProps) => {
  const skipNextOnChangeRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRevisionRef = useRef(0);
  const outputPromiseRef = useRef<Promise<void> | null>(null);
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
    let isActive = true;

    if (!initialContent || initialContent === lastEditorOutputRef.current) {
      return () => {
        isActive = false;
      };
    }

    const syncRevision = ++outputRevisionRef.current;

    /** Restores externally supplied content without overwriting newer edits. */
    const syncContent = async () => {
      const structuredBlocks =
        parseBlockStructureFromHTML(initialContent) ||
        parseBlocks(initialContent);
      const blocks =
        structuredBlocks || (await editor.tryParseHTMLToBlocks(initialContent));

      if (!isActive || syncRevision !== outputRevisionRef.current) {
        return;
      }

      const currentSerialized = JSON.stringify(editor.document);
      const nextSerialized = JSON.stringify(blocks);

      if (currentSerialized !== nextSerialized) {
        skipNextOnChangeRef.current = true;
        editor.replaceBlocks(editor.document, blocks);
      }
    };

    syncContent().catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, [editor, initialContent]);

  const emitOutput = useCallback(
    async (outputRevision: number) => {
      const blocks = editor.document;
      const html = await editor.blocksToHTMLLossy(blocks);

      if (outputRevision !== outputRevisionRef.current) {
        return;
      }

      const content = embedBlockStructureInHTML(html, blocks);

      lastEditorOutputRef.current = content;
      onChange(content);
    },
    [editor, onChange],
  );

  const startOutput = useCallback(
    (outputRevision: number) => {
      debounceTimerRef.current = null;

      const output = emitOutput(outputRevision).catch(() => undefined);

      outputPromiseRef.current = output;

      return output;
    },
    [emitOutput],
  );

  const flush = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      await startOutput(pendingRevisionRef.current);
      return;
    }

    await outputPromiseRef.current;
  }, [startOutput]);

  useEffect(() => registerCmsEditorFlush(flush), [flush]);

  const handleChange = useCallback(() => {
    const outputRevision = ++outputRevisionRef.current;

    if (skipNextOnChangeRef.current) {
      skipNextOnChangeRef.current = false;
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    pendingRevisionRef.current = outputRevision;
    debounceTimerRef.current = setTimeout(() => {
      startOutput(outputRevision);
    }, 300);
  }, [startOutput]);

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
