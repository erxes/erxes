import { Editor } from '@tiptap/react';
import { RichTextEditorLabels } from './labels';
import { createSafeContext } from './createSafeContext';
interface RichTextEditorContext {
  editor: Editor | null;
  labels: RichTextEditorLabels;
}

export const [
  RichTextEditorProvider,
  useRichTextEditorContext
] = createSafeContext<RichTextEditorContext>(
  'RichTextEditor component was not found in tree'
);
