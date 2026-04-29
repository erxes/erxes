import { Popover, type PopoverProps } from 'erxes-ui/components';
import { usePreviousHotkeyScope } from '../hooks/usePreviousHotkeyScope';
import {
  UseHotkeysOptionsWithoutBuggyOptions,
  useScopedHotkeys,
} from 'erxes-ui/modules/hotkey/hooks/useScopedHotkeys';
import { Key } from 'erxes-ui/types';
import { useState } from 'react';
import { currentHotkeyScopeState } from 'erxes-ui/modules/hotkey/states/internal/currentHotkeyScopeState';
import { useAtomValue } from 'jotai';

export const PopoverScoped = ({
  scope,
  onOpenChange,
  onEnter,
  closeOnEnter,
  dependencies,
  options,
  open,
  ...props
}: Omit<PopoverProps, 'onOpenChange'> & {
  onOpenChange?: (open: boolean, reason?: 'enter' | 'close') => void;
  scope?: string;
  onEnter?: () => void;
  closeOnEnter?: boolean;
  dependencies?: unknown[];
  options?: UseHotkeysOptionsWithoutBuggyOptions;
}) => {
  const [_open, _setOpen] = useState(false);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  const currentHotkeyScope = useAtomValue(currentHotkeyScopeState);
  const isOpen = open ?? _open;

  useScopedHotkeys(
    Key.Enter,
    () => {
      if (!isOpen) {
        return;
      }
      onEnter?.();
      if (closeOnEnter) {
        _setOpen(false);
        onOpenChange?.(false, 'enter');
      }
      if (scope) {
        goBackToPreviousHotkeyScope();
      }
    },
    scope ? scope + '.Popover' : currentHotkeyScope.scope,
    [isOpen, ...(dependencies || [])],
    {
      enableOnFormTags: closeOnEnter,
      preventDefault: isOpen && closeOnEnter,
      ...options,
    },
  );

  return (
    <Popover
      modal
      {...props}
      open={isOpen}
      onOpenChange={(op) => {
        _setOpen(op);
        onOpenChange?.(op, 'close');
        if (scope) {
          op
            ? setHotkeyScopeAndMemorizePreviousScope(scope + '.Popover')
            : goBackToPreviousHotkeyScope();
        }
      }}
    />
  );
};
