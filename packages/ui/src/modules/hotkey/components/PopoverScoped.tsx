import { Popover, type PopoverChangeDetails, type PopoverProps } from 'erxes-ui/components/popover';
import { usePreviousHotkeyScope } from '../hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from 'erxes-ui/modules/hotkey/hooks/useScopedHotkeys';
import type { Options as HotkeyOptions } from 'react-hotkeys-hook';
import { useLayoutEffect, useState } from 'react';
import { currentHotkeyScopeState } from 'erxes-ui/modules/hotkey/states/internal/currentHotkeyScopeState';
import { useAtomValue, useStore } from 'jotai';
import { useSetHotkeyScope } from '../hooks/useSetHotkeyScope';

interface ScopedHotkeysProps {
  scope?: string;
  onEnter?: () => void;
  closeOnEnter?: boolean;
  dependencies?: unknown[];
  options?: HotkeyOptions;
}

/**
 * An open popover's hotkey scope and Enter. It mounts only while the popover is open: a table
 * has a closed popover in most cells, and they neither follow the scope nor listen for Enter.
 */
const OpenPopoverHotkeys = ({
  scope,
  onEnter,
  closeOnEnter,
  dependencies,
  options,
  close,
}: ScopedHotkeysProps & { close: () => void }) => {
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const setHotkeyScope = useSetHotkeyScope();
  const store = useStore();
  const currentHotkeyScope = useAtomValue(currentHotkeyScopeState);

  useLayoutEffect(() => {
    if (!scope) return undefined;
    const previousScope = store.get(currentHotkeyScopeState);
    const popoverScope = `${scope}.Popover`;
    setHotkeyScopeAndMemorizePreviousScope(popoverScope);

    return () => {
      // A different control may have taken focus before this popover closes.
      if (store.get(currentHotkeyScopeState).scope === popoverScope) {
        setHotkeyScope(previousScope.scope, previousScope.customScopes);
      }
    };
  }, [scope, store, setHotkeyScope, setHotkeyScopeAndMemorizePreviousScope]);

  useScopedHotkeys(
    'Enter',
    () => {
      onEnter?.();

      if (closeOnEnter) close();
    },
    scope ? scope + '.Popover' : currentHotkeyScope.scope,
    dependencies ?? [],
    { enableOnFormTags: closeOnEnter, preventDefault: closeOnEnter, ...options },
  );

  return null;
};

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
}: Omit<PopoverProps, 'onOpenChange'> &
  ScopedHotkeysProps & {
    /** Closing on Enter passes no details. */
    onOpenChange?: (open: boolean, details?: PopoverChangeDetails) => void;
  }) => {
  const [_open, _setOpen] = useState(false);
  const isOpen = open ?? _open;

  return (
    <>
      {isOpen && (
        <OpenPopoverHotkeys
          scope={scope}
          onEnter={onEnter}
          closeOnEnter={closeOnEnter}
          dependencies={dependencies}
          options={options}
          close={() => {
            _setOpen(false);
            onOpenChange?.(false);
          }}
        />
      )}
      <Popover
        modal
        {...props}
        open={isOpen}
        onOpenChange={(next, details) => {
          _setOpen(next);
          onOpenChange?.(next, details);
        }}
      />
    </>
  );
};
