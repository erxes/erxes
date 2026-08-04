import { RefObject, useCallback, useState } from 'react';
import {
  getAutomationVariableDragData,
  insertAutomationVariableToken,
} from '../utils/automationVariableDragUtils';

export const useAutomationVariableDrop = ({
  value,
  onChange,
  inputRef,
}: {
  value: string;
  onChange?: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement> | null;
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const payload = getAutomationVariableDragData(event.dataTransfer);

      if (!payload) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      setIsDragActive(true);
    },
    [],
  );

  const handleDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const payload = getAutomationVariableDragData(event.dataTransfer);

      setIsDragActive(false);

      if (!payload || !onChange) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const selectionStart = inputRef?.current?.selectionStart;
      const selectionEnd = inputRef?.current?.selectionEnd;

      const { nextValue, nextCursorPosition } = insertAutomationVariableToken({
        value: value || '',
        token: payload.token,
        selectionStart,
        selectionEnd,
      });

      onChange(nextValue);

      requestAnimationFrame(() => {
        inputRef?.current?.focus();
        inputRef?.current?.setSelectionRange(
          nextCursorPosition,
          nextCursorPosition,
        );
      });
    },
    [inputRef, onChange, value],
  );

  return {
    isDragActive,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};
