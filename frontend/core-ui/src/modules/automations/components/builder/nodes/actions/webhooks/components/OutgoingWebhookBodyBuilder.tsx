import { json } from '@codemirror/lang-json';
import type { EditorView } from '@codemirror/view';
import { EditorView as CMEditorView } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import { Form } from 'erxes-ui';
import { useMemo, useRef } from 'react';
import { Attributes } from 'ui-modules/modules/automations/components/Attributes';

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
  contentType,
}: {
  value: string;
  onChange: (value: string) => void;
  contentType?: string;
}) {
  const editorRef = useRef<EditorView | null>(null);
  const extensions = useMemo(() => [json(), createTheme()], []);

  const handleAttributeSelect = (placeholder: string) => {
    if (!editorRef.current) return;

    const view = editorRef.current;
    const transaction = view.state.update({
      changes: {
        from: view.state.selection.main.from,
        to: view.state.selection.main.to,
        insert: placeholder,
      },
    });

    view.dispatch(transaction);
  };
  return (
    <Form.Item className="flex flex-col h-full">
      <Form.Message />
      <Form.Label className="flex justify-between items-center">
        Body
        <Attributes
          contentType={contentType || ''}
          onSelect={handleAttributeSelect}
          buttonText="Attributes"
        />
      </Form.Label>
      <CodeMirror
        value={`${value}` || '{}'}
        height="30rem"
        lang="json"
        extensions={extensions}
        basicSetup={{
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
        }}
        onChange={(newValue) => onChange(newValue)}
        onCreateEditor={(view) => {
          editorRef.current = view;
        }}
      />
    </Form.Item>
  );
}
