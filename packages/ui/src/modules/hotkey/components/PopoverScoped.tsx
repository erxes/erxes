import { Popover, type PopoverChangeDetails, type PopoverProps } from 'erxes-ui/components/popover';
import { usePreviousHotkeyScope } from '../hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from 'erxes-ui/modules/hotkey/hooks/useScopedHotkeys';
import type { Options as HotkeyOptions } from 'react-hotkeys-hook';
import { useLayoutEffect, useState } from 'react';
import { currentHotkeyScopeState } from 'erxes-ui/modules/hotkey/states/internal/currentHotkeyScopeState';
import { atom, useAtomValue, useStore } from 'jotai';
import { INITIAL_HOTKEYS_SCOPE } from '../constants/initialHotkeysScope';
import { useSetHotkeyScope } from '../hooks/useSetHotkeyScope';

/** What a closed popover reads instead of the current scope, which only its open Enter uses. */
const closedScopeState = atom(INITIAL_HOTKEYS_SCOPE);

/**
 * A `Popover` that takes over the hotkey scope while it is open.
 * Hotkeys of `<scope>.Popover` work only while it is open, and the scope before it comes back
 * on close. Enter calls `onEnter`, and closes it with `closeOnEnter`.
 */
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
  /** Closing on Enter passes no details. */
  onOpenChange?: (open: boolean, details?: PopoverChangeDetails) => void;
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
  const isOpen = open ?? _open;
  // A table has a closed popover in most cells: they neither re-render when the scope changes
  // nor listen for Enter.
  const currentHotkeyScope = useAtomValue(isOpen ? currentHotkeyScopeState : closedScopeState);

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
        onOpenChange?.(false);
      }
    },
    scope ? scope + '.Popover' : currentHotkeyScope.scope,
    [isOpen, ...(dependencies ?? [])],
    {
      enabled: isOpen,
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
      onOpenChange={(next, details) => {
        _setOpen(next);
        onOpenChange?.(next, details);
      }}
    />
  );
};
