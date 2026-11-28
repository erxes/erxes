import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { setHotkeyScopeState } from '../states/setHotkeyScopeState';
import type { CustomHotkeyScopes } from '../types/CustomHotkeyScope';

/**
 * Switches the hotkey scope, so the `useScopedHotkeys` of that scope run.
 * A page sets its own scope when it opens; `usePreviousHotkeyScope` also remembers the old one.
 */
export const useSetHotkeyScope = () => {
  const setHotkeyScope = useSetAtom(setHotkeyScopeState);

  return useCallback(
    (hotkeyScopeToSet: string, customScopes: CustomHotkeyScopes = {}) => {
      setHotkeyScope({ scope: hotkeyScopeToSet, customScopes });
    },
    [setHotkeyScope],
  );
};
