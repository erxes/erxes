import { useSetAtom } from 'jotai';
import { setHotkeyScopeState } from '../states/setHotkeyScopeState';
import { CustomHotkeyScopes } from '../types/CustomHotkeyScope';
import { DEBUG_HOTKEY_SCOPE } from './useScopedHotKeysCallback';
import { logDebug } from 'erxes-ui/utils/logDebug';

export const useSetHotkeyScope = () => {
  const setHotkeyScope = useSetAtom(setHotkeyScopeState);

  return (hotkeyScopeToSet: string, customScopes: CustomHotkeyScopes = {}) => {
    if (DEBUG_HOTKEY_SCOPE) {
      logDebug('DEBUG: set new hotkey scope', {
        hotkeyScopeToSet,
        customScopes,
      });
    }

    setHotkeyScope({
      scope: hotkeyScopeToSet,
      customScopes,
    });
  };
};
