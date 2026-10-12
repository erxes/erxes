import type { BlockEditorProps } from './TextEditor';

export type EditorBlock = ReturnType<
  BlockEditorProps['editor']['getTextCursorPosition']
>['block'];
