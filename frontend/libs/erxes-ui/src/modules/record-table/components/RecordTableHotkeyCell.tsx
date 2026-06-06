import React, { useEffect, useRef, useState } from 'react';
import { useRecordTableHotkey } from '../contexts/RecordTableHotkeyContext';
import { Slot } from 'radix-ui';
import { mergeRefs } from 'react-merge-refs';
import { cn } from 'erxes-ui/lib';
import { Key } from 'erxes-ui/types';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAtomValue } from 'jotai';
import { internalHotkeysEnabledScopesState } from 'erxes-ui/modules/hotkey/states/internal/internalHotkeysEnabledScopeState';
import { useSetHotkeyScope } from 'erxes-ui/modules/hotkey';

export const RecordTableHotKeyControl = React.forwardRef<
  React.ElementRef<typeof Slot.Root>,
  React.ComponentPropsWithoutRef<typeof Slot.Root> & {
    rowId: string;
    rowIndex: number;
    colIndex?: number;
    enableOnFormTags?: boolean;
  }
>(
  (
    {
      rowId,
      rowIndex,
      colIndex: colIndexProp,
      enableOnFormTags = false,
      className,
      onClickCapture,
      ...props
    },
    ref,
  ) => {
    const controlRef = useRef<HTMLTableCellElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const { activeCell, setActiveRow, setActiveCell, scope } =
      useRecordTableHotkey();
    const enabledScopes = useAtomValue(internalHotkeysEnabledScopesState);
    const setHotkeyScope = useSetHotkeyScope();

    const colIndex = colIndexProp ?? controlRef.current?.cellIndex;

    useHotkeys(
      Key.Enter,
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        controlRef.current?.querySelector('button')?.click();
      },
      {
        enabled: isFocused && enabledScopes.includes(scope),
        preventDefault: true,
        enableOnFormTags,
      },
      [enableOnFormTags, enabledScopes, isFocused, scope],
    );

    const handleFocus = (focused: boolean) => {
      setIsFocused(focused);
      if (!focused && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };

    useEffect(() => {
      const isActive = activeCell[0] === rowIndex && activeCell[1] === colIndex;
      if (isActive) {
        setHotkeyScope(scope);
        handleFocus(true);
        setActiveRow(rowId);
      } else if (isFocused) {
        handleFocus(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCell]);

    return (
      <Slot.Root
        ref={mergeRefs([ref, controlRef])}
        {...props}
        onClickCapture={(event) => {
          onClickCapture?.(event);
          setHotkeyScope(scope);
          setIsFocused(true);
          setActiveRow(rowId);
          setActiveCell([rowIndex, colIndex ?? 0]);
        }}
        className={cn(
          isFocused &&
            '*:outline-solid *:outline-1 *:outline-primary *:rounded *:outline-offset-0',
          className,
        )}
      />
    );
  },
);

RecordTableHotKeyControl.displayName = 'RecordTableHotKeyControl';
