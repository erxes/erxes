import {
  FormattingToolbarController,
  useBlockNoteEditor,
} from '@blocknote/react';
import { ToolbarContents } from './ToolbarContents';
import { getToolbarPositioning } from '../utils/getToolbarPositioning';
import { useMemo } from 'react';

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
