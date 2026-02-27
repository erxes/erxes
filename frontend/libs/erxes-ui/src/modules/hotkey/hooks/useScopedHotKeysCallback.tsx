import {
  Hotkey,
  OptionsOrDependencyArray,
} from 'react-hotkeys-hook/dist/types';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import { internalHotkeysEnabledScopesState } from '../states/internal/internalHotkeysEnabledScopeState';
import { logDebug } from 'erxes-ui/utils/logDebug';

export const DEBUG_HOTKEY_SCOPE = false;

export const useScopedHotKeysCallback = (
  dependencies?: OptionsOrDependencyArray,
) => {
  const dependencyArray = Array.isArray(dependencies) ? dependencies : [];

  return useAtomCallback(
    useCallback(
      (
        get,
        set,
        {
          callback,
          hotkeysEvent,
          keyboardEvent,
          scope,
          preventDefault,
        }: {
          keyboardEvent: KeyboardEvent;
          hotkeysEvent: Hotkey;
          callback: (
            keyboardEvent: KeyboardEvent,
            hotkeysEvent: Hotkey,
          ) => void;
          scope: string;
          preventDefault?: boolean;
        },
      ) => {
        const currentHotkeyScopes = get(internalHotkeysEnabledScopesState);

        if (!currentHotkeyScopes.includes(scope)) {
          if (DEBUG_HOTKEY_SCOPE) {
            logDebug(
              `DEBUG: %cI can't call hotkey (${
                hotkeysEvent.keys
              }) because I'm in scope [${scope}] and the active scopes are : [${currentHotkeyScopes.join(
                ', ',
              )}]`,
              'color: gray; ',
            );
          }
          return;
        }

        if (DEBUG_HOTKEY_SCOPE) {
          logDebug(
            `DEBUG: %cI can call hotkey (${
              hotkeysEvent.keys
            }) because I'm in scope [${scope}] and the active scopes are : [${currentHotkeyScopes.join(
              ', ',
            )}]`,
            'color: green;',
          );
        }

        if (preventDefault === true) {
          if (DEBUG_HOTKEY_SCOPE) {
            logDebug(
              `DEBUG: %cI prevent default for hotkey (${hotkeysEvent.keys})`,
              'color: gray;',
            );
          }
          keyboardEvent.stopPropagation();
          keyboardEvent.preventDefault();
          keyboardEvent.stopImmediatePropagation();
        }

        callback(keyboardEvent, hotkeysEvent);
      },
      [dependencyArray],
    ),
  );
};
