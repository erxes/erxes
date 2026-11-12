import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import { currentHotkeyScopeState } from '../states/internal/currentHotkeyScopeState';
import { previousHotkeyScopeState } from '../states/internal/previousHotkeyScopeState';
import type { CustomHotkeyScopes } from '../types/CustomHotkeyScope';
import { useSetHotkeyScope } from './useSetHotkeyScope';

export const usePreviousHotkeyScope = () => {
  const setHotKeyScope = useSetHotkeyScope();

  const goBackToPreviousHotkeyScope = useAtomCallback(
    useCallback(
      (get) => {
        const previousHotkeyScope = get(previousHotkeyScopeState);

        if (!previousHotkeyScope) {
          return;
        }

        setHotKeyScope(previousHotkeyScope.scope, previousHotkeyScope.customScopes);
      },
      [setHotKeyScope],
    ),
  );

  const setHotkeyScopeAndMemorizePreviousScope = useAtomCallback(
    useCallback(
      (get, set, scope: string, customScopes?: CustomHotkeyScopes) => {
        const currentHotkeyScope = get(currentHotkeyScopeState);

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
