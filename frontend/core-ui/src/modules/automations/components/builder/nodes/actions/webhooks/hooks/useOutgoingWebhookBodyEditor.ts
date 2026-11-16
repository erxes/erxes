import { normalizeOutgoingWebhookBodyValue } from '@/automations/components/builder/nodes/actions/webhooks/utils/outgoingWebhookBodyBuilder';
import { json } from '@codemirror/lang-json';
import { EditorView as CMEditorView } from '@codemirror/view';
import { useMemo } from 'react';
import { useAutomationVariableCodeMirrorDrop } from 'ui-modules';

function createTheme() {
  return CMEditorView.theme({
    '&': {
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
    },
    '.cm-content': {
      padding: '0.75rem',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.875rem',
    },
    '.cm-focused': {
      outline: 'none',
      borderColor: 'var(--ring)',
    },
    '.cm-editor': {
      borderRadius: 'var(--radius)',
    },
    '.cm-scroller': {
      borderRadius: 'var(--radius)',
    },
    '.cm-gutters': {
      backgroundColor: 'var(--muted)',
      border: 'none',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      color: 'var(--muted-foreground)',
    },
    '.cm-activeLine': {
      backgroundColor: 'var(--accent)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'var(--accent)',
    },
    '.cm-selectionBackground': {
      backgroundColor: 'var(--secondary)',
    },
  });
}

/**
 * The webhook body editor: the value shown for the chosen body mode, and a
 * JSON editor that also takes variables dropped onto it.
 */
export const useOutgoingWebhookBodyEditor = (
  value: string,
  bodyMode: 'json' | 'text',
  onChange: (value: string) => void,
) => {
  const baseExtensions = useMemo(() => [json(), createTheme()], []);
  const { isDragActive, editorExtensions } =
    useAutomationVariableCodeMirrorDrop({ onChange });
  const extensions = useMemo(
    () => [...baseExtensions, ...editorExtensions],
    [editorExtensions, baseExtensions],
  );

  return {
    normalizedValue: normalizeOutgoingWebhookBodyValue(value, bodyMode),
    isTextMode: bodyMode === 'text',
    isDragActive,
    extensions,
  };
};
