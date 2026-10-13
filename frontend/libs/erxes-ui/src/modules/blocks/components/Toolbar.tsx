import { useMemo } from 'react';
import {
  FormattingToolbarController,
  useBlockNoteEditor,
} from '@blocknote/react';
import { ToolbarContents } from './toolbar/ToolbarContents';
import { getToolbarPositioning } from '../utils/toolbar/getToolbarPositioning';

export const Toolbar = () => {
  const editor = useBlockNoteEditor();
  const floatingOptions = useMemo(
    () => getToolbarPositioning(() => editor.domElement),
    [editor],
  );
  return (
    <FormattingToolbarController
      formattingToolbar={ToolbarContents}
      floatingOptions={floatingOptions}
    />
  );
};
