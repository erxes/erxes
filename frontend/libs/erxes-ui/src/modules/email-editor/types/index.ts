import type { EditorProps as MailyEditorProps } from '@maily-to/core';
import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';

export type { JSONContent };

export interface EmailEditorVariable {
  name: string;
  label?: string;
  required?: boolean;
  hideDefaultValue?: boolean;
}

export type EmailEditorVariablesResolver = (opts: {
  query: string;
  from: 'content-variable' | 'bubble-variable' | 'repeat-variable';
  editor: TiptapEditor;
}) => EmailEditorVariable[];

export type EmailEditorVariables = EmailEditorVariable[] | EmailEditorVariablesResolver;

export interface EmailEditorProps {
  /** Tiptap JSON document. Undefined/empty starts a blank email. */
  contentJson?: JSONContent;
  /** Fires on every content change with the current Tiptap JSON document. */
  onChange?: (contentJson: JSONContent) => void;
  /** Fires once the underlying Tiptap editor instance is created. */
  onCreate?: (editor: TiptapEditor) => void;
  /** The personalization variables offered behind the `@` trigger. */
  variables?: EmailEditorVariables;
  /** Called when a user drops/pastes/inserts an image. Defaults to the erxes upload endpoint. */
  onImageUpload?: (file: File) => Promise<string>;
  /** Slash-command groups. Defaults to Maily's built-in block set (includes the Custom HTML block). */
  blocks?: MailyEditorProps['blocks'];
  /** Extra Tiptap extensions appended after the default email extension set. */
  extensions?: MailyEditorProps['extensions'];
  placeholder?: string;
  className?: string;
}
