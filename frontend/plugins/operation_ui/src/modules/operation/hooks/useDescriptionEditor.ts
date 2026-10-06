import { useBlockEditor } from 'erxes-ui';
import { useEffect, useState } from 'react';
import {
  isMarkdownDescription,
  parseDescriptionBlocks,
} from '../utils/parseDescriptionBlocks';

interface DescriptionEditorResult {
  editor: ReturnType<typeof useBlockEditor>;
  isReady: boolean;
}

export const useDescriptionEditor = (
  description: string | null | undefined,
  placeholder: string,
): DescriptionEditorResult => {
  const [isReady, setIsReady] = useState(
    () => !isMarkdownDescription(description),
  );
  const editor = useBlockEditor({
    initialContent: parseDescriptionBlocks(description),
    placeholder,
  });

  useEffect(() => {
    if (!description || !isMarkdownDescription(description)) {
      setIsReady(true);
      return;
    }

    let active = true;
    setIsReady(false);
    editor
      .tryParseMarkdownToBlocks(description)
      .then((blocks) => {
        if (!active) return;
        if (blocks.length) {
          editor.replaceBlocks(editor.document, blocks);
        }
        setIsReady(true);
      })
      .catch(() => {
        if (active) setIsReady(true);
      });

    return () => {
      active = false;
    };
  }, [description, editor]);

  return { editor, isReady };
};
