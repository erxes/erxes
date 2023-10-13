import { Editor } from '@tiptap/react';
import { RichTextEditorLabels } from './labels';
import { createSafeContext } from './hooks';
interface RichTextEditorContext {
  editor: Editor | null;
  labels: RichTextEditorLabels;
  withCodeHighlightStyles: boolean | undefined;
  withTypographyStyles: boolean | undefined;
  unstyled: boolean | undefined;
}

export const [
  RichTextEditorProvider,
  useRichTextEditorContext
] = createSafeContext<RichTextEditorContext>(
  'RichTextEditor component was not found in tree'
);
