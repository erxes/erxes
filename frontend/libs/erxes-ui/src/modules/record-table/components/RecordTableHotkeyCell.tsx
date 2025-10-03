import React, { useEffect, useRef, useState } from 'react';
import { useRecordTableHotkey } from '../contexts/RecordTableHotkeyContext';
import { Slot } from 'radix-ui';
import { mergeRefs } from 'react-merge-refs';
import { cn } from 'erxes-ui/lib';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'erxes-ui/types';

export const RecordTableHotKeyControl = React.forwardRef<
  React.ElementRef<typeof Slot.Root>,
  React.ComponentPropsWithoutRef<typeof Slot.Root> & {
    rowId: string;
    rowIndex: number;
  }
>(({ rowId, rowIndex, className, onClickCapture, ...props }, ref) => {
  const controlRef = useRef<HTMLTableCellElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { activeCell, setActiveRow, setActiveCell } = useRecordTableHotkey();

  const innerButton = controlRef.current?.querySelector('button');
  const colIndex = controlRef.current?.cellIndex;

  useHotkeys(
    Key.Enter,
    () => {
      innerButton?.click();
    },
    {
      enabled: isFocused,
    },
  );

  const handleFocus = (focused: boolean) => {
    setIsFocused(focused);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  useEffect(() => {
    const isActive = activeCell[0] === rowIndex && activeCell[1] === colIndex;
    if (isActive) {
      handleFocus(true);
      setActiveRow(rowId);
    }
    isFocused && handleFocus(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCell]);

  return (
    <Slot.Root
      ref={mergeRefs([ref, controlRef])}
      {...props}
      onClickCapture={() => {
        setIsFocused(true);
        setActiveRow(rowId);
        setActiveCell([rowIndex, colIndex || 0]);
      }}
      className={cn(
        isFocused &&
          '[&>*]:outline [&>*]:outline-1 [&>*]:outline-primary [&>*]:rounded [&>*]:outline-offset-0',
        className,
      )}
    />
  );
});

RecordTableHotKeyControl.displayName = 'RecordTableHotKeyControl';
