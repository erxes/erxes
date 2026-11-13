import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import { type HotkeyCallback, type Keys, type Options, useHotkeys } from 'react-hotkeys-hook';
import { internalHotkeysEnabledScopesState } from '../states/internal/internalHotkeysEnabledScopeState';

/** Runs `callback` on `keys` only while `scope` is one of the enabled hotkey scopes. */
export const useScopedHotkeys = (
  keys: Keys,
  callback: HotkeyCallback,
  scope: string,
  dependencies?: unknown[],
  options?: Options,
) => {
  const isScopeEnabled = useAtomCallback(
    useCallback((get) => get(internalHotkeysEnabledScopesState).includes(scope), [scope]),
  );

  const preventDefault = (options?.preventDefault ?? true) === true;

  return useHotkeys(
    keys,
    (keyboardEvent, hotkeysEvent) => {
      if (!isScopeEnabled()) return;

      if (preventDefault) {
        keyboardEvent.stopPropagation();
        keyboardEvent.preventDefault();
        keyboardEvent.stopImmediatePropagation();
      }

      callback(keyboardEvent, hotkeysEvent);
    },
    { enableOnContentEditable: true, ...options },
    dependencies,
  );
};
