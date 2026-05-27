import { IBlockEditor } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { insertAutomationVariableInBlockEditor } from '../utils/automationVariableBlockEditorUtils';
import { getAutomationVariableDragData } from '../utils/automationVariableDragUtils';

export const useAutomationVariableBlockEditorDrop = ({
  editor,
}: {
  editor: IBlockEditor;
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    const payload = getAutomationVariableDragData(event.dataTransfer);

    if (!payload) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      const payload = getAutomationVariableDragData(event.dataTransfer);

      setIsDragActive(false);

      if (!payload) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      insertAutomationVariableInBlockEditor({
        editor,
        payload,
      });
    },
    [editor],
  );

  return {
    isDragActive,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};
