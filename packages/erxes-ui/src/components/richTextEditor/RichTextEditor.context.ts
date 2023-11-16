import { Editor } from '@tiptap/react';
import { IRichTextEditorLabels } from './labels';
import { createSafeContext } from './createSafeContext';
interface IRichTextEditorContext {
  editor: Editor | null;
  labels: IRichTextEditorLabels;
}

export const [
  RichTextEditorProvider,
  useRichTextEditorContext
] = createSafeContext<IRichTextEditorContext>(
  'RichTextEditor component was not found in tree'
);
