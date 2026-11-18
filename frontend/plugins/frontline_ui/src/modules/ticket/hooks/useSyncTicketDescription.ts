import { Block } from '@blocknote/core';
import { useBlockEditor } from 'erxes-ui';
import { MutableRefObject, useCallback, useEffect, useRef } from 'react';

type TProps = {
  editor: ReturnType<typeof useBlockEditor> | undefined;
  description: string | null | undefined;
  descriptionContent: Block[] | undefined;
  loadedDescriptionRef: MutableRefObject<Block[] | undefined>;
  parseDescription: (description: string | undefined) => Block[] | undefined;
};

// The editor reads its content once; a description written elsewhere (an
// automation, another user) is pulled in unless the user is typing here.
export const useSyncTicketDescription = ({
  editor,
  description,
  descriptionContent,
  loadedDescriptionRef,
  parseDescription,
}: TProps) => {
  const lastSyncedRef = useRef(description);
  const lastSentRef = useRef<string | null>(null);
  const applyingRef = useRef(false);

  useEffect(() => {
    if (!editor || typeof description !== 'string') return;

    if (
      description === lastSyncedRef.current ||
      description === lastSentRef.current
    ) {
      lastSyncedRef.current = description;
      return;
    }

    const hasUnsavedEdit =
      descriptionContent !== loadedDescriptionRef.current &&
      JSON.stringify(descriptionContent) !== lastSentRef.current;

    if (editor.isFocused() || hasUnsavedEdit) return;

    const blocks = parseDescription(description);

    applyingRef.current = true;
    editor.replaceBlocks(
      editor.document,
      blocks?.length ? blocks : [{ type: 'paragraph' }],
    );
    lastSyncedRef.current = description;
  }, [
    editor,
    description,
    descriptionContent,
    loadedDescriptionRef,
    parseDescription,
  ]);

  const markDescriptionSent = useCallback((value: string) => {
    lastSentRef.current = value;
  }, []);

  // True once for the editor change caused by pulling a description in, so
  // it is not saved back as if the user had typed it.
  const consumeExternalChange = useCallback(() => {
    const external = applyingRef.current;
    applyingRef.current = false;
    return external;
  }, []);

  return { markDescriptionSent, consumeExternalChange };
};
