import { Editor } from 'erxes-ui';
import { useEffect, useRef } from 'react';

// Editor emits changes after a 300ms debounce.
const EDITOR_SETTLE_MS = 350;

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
  const containerRef = useRef<HTMLDivElement>(null);
  const latest = useRef(value);
  const saved = useRef(value);

  useEffect(() => {
    latest.current = value;
    saved.current = value;
  }, [value]);

  useEffect(() => {
    const focusDescription = (event: KeyboardEvent) => {
      if (
        event.key !== '/' ||
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.repeat ||
        event.isComposing ||
        readonly
      ) {
        return;
      }

      const target = event.target;

      if (
        target instanceof Element &&
        target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]',
        )
      ) {
        return;
      }

      const editor = containerRef.current?.querySelector<HTMLElement>('[contenteditable="true"]');

      if (
        !editor?.getClientRects().length ||
        editor.closest('[hidden], [inert], [role="tabpanel"][data-state="inactive"]') ||
        Array.from(
          document.querySelectorAll<HTMLElement>(
            '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]',
          ),
        ).some((overlay) => overlay.getClientRects().length > 0)
      ) {
        return;
      }

      event.preventDefault();
      editor.focus();
    };

    document.addEventListener('keydown', focusDescription);

    return () => document.removeEventListener('keydown', focusDescription);
  }, [readonly]);

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
