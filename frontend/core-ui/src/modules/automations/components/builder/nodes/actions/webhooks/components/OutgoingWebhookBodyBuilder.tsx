import { json } from '@codemirror/lang-json';
import { EditorView as CMEditorView } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import { cn, Form } from 'erxes-ui';
import { useMemo } from 'react';
import { useAutomationVariableCodeMirrorDrop } from 'ui-modules';
import { normalizeOutgoingWebhookBodyValue } from '@/automations/components/builder/nodes/actions/webhooks/utils/outgoingWebhookBodyBuilder';

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

export function OutgoingWebhookBodyBuilder({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const extensions = useMemo(() => [json(), createTheme()], []);
  const normalizedValue = normalizeOutgoingWebhookBodyValue(value);
  const { isDragActive, editorExtensions } = useAutomationVariableCodeMirrorDrop({
    onChange,
  });
  const mergedExtensions = useMemo(
    () => [...extensions, ...editorExtensions],
    [editorExtensions, extensions],
  );

  return (
    <Form.Item className="flex flex-col h-full">
      <Form.Message />
      <Form.Label>Body</Form.Label>
      <div
        className={cn(
          'rounded-md transition-colors',
          isDragActive ? 'ring-2 ring-primary/40 ring-offset-2' : '',
        )}
      >
        <CodeMirror
          value={normalizedValue}
          height="30rem"
          lang="json"
          extensions={mergedExtensions}
          basicSetup={{
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
          }}
          onChange={(newValue) => onChange(newValue)}
        />
      </div>
    </Form.Item>
  );
}
