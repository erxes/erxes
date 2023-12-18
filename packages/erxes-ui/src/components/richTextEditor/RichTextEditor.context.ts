import { Editor } from '@tiptap/react';
import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { IRichTextEditorLabels } from './labels';
import { createSafeContext } from './createSafeContext';
interface IRichTextEditorContext {
  editor: Editor | null;
  labels: IRichTextEditorLabels;
  isSourceEnabled: boolean;
  toggleSource: () => void;
  codeMirrorRef?: React.RefObject<ReactCodeMirrorRef>;
}

export const [
  RichTextEditorProvider,
  useRichTextEditorContext
] = createSafeContext<IRichTextEditorContext>(
  'RichTextEditor component was not found in tree'
);
