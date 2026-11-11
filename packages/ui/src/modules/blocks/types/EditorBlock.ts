import type { BlockEditorProps } from 'erxes-ui/modules/blocks/types/TextEditor';

export type EditorBlock = ReturnType<
  BlockEditorProps['editor']['getTextCursorPosition']
>['block'];
