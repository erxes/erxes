import React, { useEffect, useState } from 'react';
import { useRecordTableHotkey } from '../contexts/RecordTableHotkeyContext';
import { Slot } from 'radix-ui';
import { mergeRefs } from 'react-merge-refs';
import { cn } from 'erxes-ui/lib/utils';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAtomValue } from 'jotai';
import { internalHotkeysEnabledScopesState } from 'erxes-ui/modules/hotkey/states/internal/internalHotkeysEnabledScopeState';
import { useSetHotkeyScope } from 'erxes-ui/modules/hotkey/hooks/useSetHotkeyScope';

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
    const [cell, setCell] = useState<HTMLElement | null>(null);
    const { activeCell, setActiveRow, setActiveCell, scope } = useRecordTableHotkey();
    const enabledScopes = useAtomValue(internalHotkeysEnabledScopesState);
    const setHotkeyScope = useSetHotkeyScope();

    const colIndex =
      colIndexProp ?? (cell instanceof HTMLTableCellElement ? cell.cellIndex : undefined);

    const isFocused = activeCell[0] === rowIndex && activeCell[1] === colIndex;

    useHotkeys(
      'Enter',
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        cell?.querySelector('button')?.click();
      },
      {
        enabled: isFocused && enabledScopes.includes(scope),
        preventDefault: true,
        enableOnFormTags,
      },
      [cell, enableOnFormTags, enabledScopes, isFocused, scope],
    );

    // The active cell takes the hotkey scope and its row; leaving it drops focus inside it.
    useEffect(() => {
      if (!isFocused) return undefined;

      setHotkeyScope(scope);
      setActiveRow(rowId);

      return () => {
        const focused = document.activeElement;

        if (focused instanceof HTMLElement && cell?.contains(focused)) focused.blur();
      };
    }, [isFocused, scope, rowId, cell, setHotkeyScope, setActiveRow]);

    return (
      <Slot.Root
        ref={mergeRefs([ref, setCell])}
        {...props}
        onClickCapture={(event) => {
          onClickCapture?.(event);
          setActiveCell([rowIndex, colIndex ?? 0]);
        }}
        className={cn(
          isFocused && '*:outline-solid *:outline-1 *:outline-primary *:rounded *:outline-offset-0',
          className,
        )}
      />
    );
  },
);

RecordTableHotKeyControl.displayName = 'RecordTableHotKeyControl';
