import { useAtomCallback } from 'jotai/utils';
import { useSetHotkeyScope } from './useSetHotkeyScope';
import { useCallback } from 'react';
import { previousHotkeyScopeState } from '../states/internal/previousHotkeyScopeState';
import { currentHotkeyScopeState } from '../states/internal/currentHotkeyScopeState';
import { CustomHotkeyScopes } from '../types/CustomHotkeyScope';
import { DEBUG_HOTKEY_SCOPE } from './useScopedHotKeysCallback';
import { logDebug } from 'erxes-ui/utils/logDebug';

export const usePreviousHotkeyScope = () => {
  const setHotKeyScope = useSetHotkeyScope();

  const goBackToPreviousHotkeyScope = useAtomCallback(
    useCallback(
      (get) => {
        const previousHotkeyScope = get(previousHotkeyScopeState);

        if (!previousHotkeyScope) {
          return;
        }

        if (DEBUG_HOTKEY_SCOPE) {
          logDebug('DEBUG: goBackToPreviousHotkeyScope', previousHotkeyScope);
        }

        setHotKeyScope(
          previousHotkeyScope.scope,
          previousHotkeyScope.customScopes,
        );
      },
      [setHotKeyScope],
    ),
  );

  const setHotkeyScopeAndMemorizePreviousScope = useAtomCallback(
    useCallback(
      (get, set, scope: string, customScopes?: CustomHotkeyScopes) => {
        const currentHotkeyScope = get(currentHotkeyScopeState);

        if (DEBUG_HOTKEY_SCOPE) {
          logDebug('DEBUG: setHotkeyScopeAndMemorizePreviousScope', {
            currentHotkeyScope,
            scope,
            customScopes,
          });
        }

        setHotKeyScope(scope, customScopes);
        set(previousHotkeyScopeState, currentHotkeyScope);
      },
      [setHotKeyScope],
    ),
  );

  return {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  };
};
