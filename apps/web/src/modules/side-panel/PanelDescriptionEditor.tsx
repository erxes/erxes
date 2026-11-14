import { Editor } from 'erxes-ui';
import type { RefObject } from 'react';
import { usePageHotkey } from '~/lib/usePageHotkey';
import { useSaveOnLeave } from './useSaveOnLeave';

/** The editor inside `container`, when it is shown (an inactive tab's panel is `hidden`). */
const visibleEditor = (container: HTMLElement | null) => {
  const editor = container?.querySelector<HTMLElement>('[contenteditable="true"]');

  if (!editor?.getClientRects().length) return null;

  return editor.closest('[hidden], [inert]') ? null : editor;
};

/** `/` focuses the description editor, unless it is read-only or not shown (another panel's may be). */
const useSlashFocus = (containerRef: RefObject<HTMLDivElement | null>, readonly?: boolean) =>
  usePageHotkey('/', () => visibleEditor(containerRef.current)?.focus(), {
    useKey: true,
    when: () => !readonly && visibleEditor(containerRef.current) !== null,
  });

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
        className="h-full min-h-0 flex-1 [&_.bn-container]:h-full [&_.bn-editor]:min-h-full"
      />
    </div>
  );
};
