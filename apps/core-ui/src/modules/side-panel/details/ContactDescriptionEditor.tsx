import { Editor } from 'erxes-ui';
import { useEffect, useRef } from 'react';

// Editor emits changes after a 300ms debounce.
const EDITOR_SETTLE_MS = 350;

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
const useSlashFocus = (readonly: boolean | undefined) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
  }, [readonly]);

  return containerRef;
};

export const ContactDescriptionEditor = ({
  value,
  scope,
  readonly,
  onSave,
}: {
  value: string;
  scope: string;
  readonly?: boolean;
  onSave: (description: string) => void;
}) => {
  const containerRef = useSlashFocus(readonly);
  const latest = useRef(value);
  const saved = useRef(value);

  useEffect(() => {
    latest.current = value;
    saved.current = value;
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 flex-1 flex-col p-3"
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        setTimeout(() => {
          if (!readonly && latest.current !== saved.current) {
            saved.current = latest.current;
            onSave(latest.current);
          }
        }, EDITOR_SETTLE_MS);
      }}
    >
      <Editor
        initialContent={value}
        onChange={(description) => {
          latest.current = description;
        }}
        scope={scope}
        readonly={readonly}
        variant="default"
        className="h-full min-h-0 flex-1 rounded-none pt-0 shadow-none [&_.bn-container]:h-full [&_.bn-editor]:min-h-full [&_.bn-editor]:outline-none"
      />
    </div>
  );
};
