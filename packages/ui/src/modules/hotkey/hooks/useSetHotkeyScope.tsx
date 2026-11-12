import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { setHotkeyScopeState } from '../states/setHotkeyScopeState';
import type { CustomHotkeyScopes } from '../types/CustomHotkeyScope';

export const useSetHotkeyScope = () => {
  const setHotkeyScope = useSetAtom(setHotkeyScopeState);

  return useCallback(
    (hotkeyScopeToSet: string, customScopes: CustomHotkeyScopes = {}) => {
      setHotkeyScope({ scope: hotkeyScopeToSet, customScopes });
    },
    [setHotkeyScope],
  );
};
