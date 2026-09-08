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
  contentJson?: JSONContent;
  onChange?: (contentJson: JSONContent) => void;
  onCreate?: (editor: TiptapEditor) => void;
  variables?: EmailEditorVariables;
  onImageUpload?: (file: File) => Promise<string>;
  blocks?: MailyEditorProps['blocks'];
  extensions?: MailyEditorProps['extensions'];
  placeholder?: string;
  className?: string;
}
