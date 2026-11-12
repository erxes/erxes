import type { Hotkey } from 'react-hotkeys-hook/dist/types';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import { internalHotkeysEnabledScopesState } from '../states/internal/internalHotkeysEnabledScopeState';

/** Runs a hotkey callback only while its scope is enabled. */
export const useScopedHotKeysCallback = () =>
  useAtomCallback(
    useCallback(
      (
        get,
        _set,
        {
          callback,
          hotkeysEvent,
          keyboardEvent,
          scope,
          preventDefault,
        }: {
          keyboardEvent: KeyboardEvent;
          hotkeysEvent: Hotkey;
          callback: (keyboardEvent: KeyboardEvent, hotkeysEvent: Hotkey) => void;
          scope: string;
          preventDefault?: boolean;
        },
      ) => {
        if (!get(internalHotkeysEnabledScopesState).includes(scope)) return;

        if (preventDefault === true) {
          keyboardEvent.stopPropagation();
          keyboardEvent.preventDefault();
          keyboardEvent.stopImmediatePropagation();
        }

        callback(keyboardEvent, hotkeysEvent);
      },
      [],
    ),
  );
