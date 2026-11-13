import { Editor } from 'erxes-ui';
import { useEffect, type RefObject } from 'react';
import { useSaveOnLeave } from './useSaveOnLeave';

const TYPING_TARGET =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]';

const OVERLAY = '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]';

/** A bare `/` typed outside any input, while nothing covers the page. */
const isFocusKey = (event: KeyboardEvent) =>
  event.key === '/' &&
  !event.defaultPrevented &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.altKey &&
  !event.shiftKey &&
  !event.repeat &&
  !event.isComposing &&
  !(event.target instanceof Element && event.target.closest(TYPING_TARGET)) &&
  !Array.from(document.querySelectorAll<HTMLElement>(OVERLAY)).some(
    (overlay) => overlay.getClientRects().length > 0,
  );

/** The editor inside `container`, when it is shown. */
const visibleEditor = (container: HTMLElement | null) => {
  const editor = container?.querySelector<HTMLElement>('[contenteditable="true"]');

  if (!editor?.getClientRects().length) return null;

  return editor.closest('[hidden], [inert], [role="tabpanel"][data-state="inactive"]')
    ? null
    : editor;
};

/** `/` focuses the description editor, unless it is read-only. */
const useSlashFocus = (containerRef: RefObject<HTMLDivElement | null>, readonly?: boolean) => {
  useEffect(() => {
    if (readonly) return undefined;

    const focusDescription = (event: KeyboardEvent) => {
      const editor = isFocusKey(event) ? visibleEditor(containerRef.current) : null;

      if (!editor) return;

      event.preventDefault();
      editor.focus();
    };

    document.addEventListener('keydown', focusDescription);

    return () => document.removeEventListener('keydown', focusDescription);
  }, [containerRef, readonly]);
};

/** A record's description as a full-size tab, saved when the editor loses focus. */
export const PanelDescriptionEditor = ({
  value,
  scope,
  readonly,
  isHTML,
  onSave,
}: {
  value: string;
  scope: string;
  readonly?: boolean;
  /** Stores HTML instead of the editor's blocks. */
  isHTML?: boolean;
  onSave: (description: string) => void;
}) => {
  const { containerRef, onChange } = useSaveOnLeave({ value, readonly, onSave });

  useSlashFocus(containerRef, readonly);

  return (
    <div ref={containerRef} className="flex min-h-0 flex-1 flex-col p-3">
      <Editor
        initialContent={value}
        onChange={onChange}
        scope={scope}
        readonly={readonly}
        isHTML={isHTML}
        variant="default"
        className="h-full min-h-0 flex-1 rounded-none pt-0 shadow-none [&_.bn-container]:h-full [&_.bn-editor]:min-h-full [&_.bn-editor]:outline-none"
      />
    </div>
  );
};
