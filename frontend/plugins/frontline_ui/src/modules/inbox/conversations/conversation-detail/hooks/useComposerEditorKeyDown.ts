import { useEffect, useRef } from 'react';

type ComposerEditorKeyDownOptions = {
  isInternalNote: boolean;
  isSlashMenuOpen: boolean;
  isUploading: boolean;
  loading: boolean;
  onlyInternal: boolean;
  showSuggestions: boolean;
  onInternalNoteChange: (internal: boolean) => void;
  onSuggestionKeyDown: (event: KeyboardEvent) => void;
};

export const useComposerEditorKeyDown = ({
  isInternalNote,
  isSlashMenuOpen,
  isUploading,
  loading,
  onlyInternal,
  showSuggestions,
  onInternalNoteChange,
  onSuggestionKeyDown,
}: ComposerEditorKeyDownOptions) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = editorRef.current;
    if (!node) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Tab' &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        !loading &&
        !isUploading &&
        !showSuggestions &&
        !isSlashMenuOpen &&
        event.target instanceof HTMLElement &&
        event.target.isContentEditable &&
        !node.querySelector('.bn-suggestion-decorator')
      ) {
        const nextInternal = !event.shiftKey;

        if (
          nextInternal !== isInternalNote &&
          (nextInternal || !onlyInternal)
        ) {
          event.preventDefault();
          event.stopPropagation();
          onInternalNoteChange(nextInternal);
          return;
        }
      }

      onSuggestionKeyDown(event);
    };

    node.addEventListener('keydown', onKeyDown, true);

    return () => {
      node.removeEventListener('keydown', onKeyDown, true);
    };
  }, [
    isInternalNote,
    isSlashMenuOpen,
    isUploading,
    loading,
    onlyInternal,
    showSuggestions,
    onInternalNoteChange,
    onSuggestionKeyDown,
  ]);

  return editorRef;
};
