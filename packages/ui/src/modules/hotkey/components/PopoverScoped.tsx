import { Popover, type PopoverProps } from 'erxes-ui/components/popover';
import { usePreviousHotkeyScope } from '../hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from 'erxes-ui/modules/hotkey/hooks/useScopedHotkeys';
import type { Options as HotkeyOptions } from 'react-hotkeys-hook';
import { useLayoutEffect, useState } from 'react';
import { currentHotkeyScopeState } from 'erxes-ui/modules/hotkey/states/internal/currentHotkeyScopeState';
import { useAtomValue, useStore } from 'jotai';
import { useSetHotkeyScope } from '../hooks/useSetHotkeyScope';

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
  options?: HotkeyOptions;
}) => {
  const [_open, _setOpen] = useState(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const setHotkeyScope = useSetHotkeyScope();
  const store = useStore();
  const currentHotkeyScope = useAtomValue(currentHotkeyScopeState);
  const isOpen = open ?? _open;

  useLayoutEffect(() => {
    if (!isOpen || !scope) return undefined;
    const previousScope = store.get(currentHotkeyScopeState);
    const popoverScope = `${scope}.Popover`;
    setHotkeyScopeAndMemorizePreviousScope(popoverScope);

    return () => {
      // A different control may have taken focus before this popover closes.
      if (store.get(currentHotkeyScopeState).scope === popoverScope) {
        setHotkeyScope(previousScope.scope, previousScope.customScopes);
      }
    };
  }, [isOpen, scope, store, setHotkeyScope, setHotkeyScopeAndMemorizePreviousScope]);

  useScopedHotkeys(
    'Enter',
    () => {
      if (!isOpen) {
        return;
      }

      onEnter?.();

      if (closeOnEnter) {
        _setOpen(false);
        onOpenChange?.(false, 'enter');
      }
    },
    scope ? scope + '.Popover' : currentHotkeyScope.scope,
    [isOpen, ...(dependencies ?? [])],
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
      }}
    />
  );
};
