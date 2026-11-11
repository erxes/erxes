import { Keys, Options } from 'react-hotkeys-hook/dist/types';
import { usePreviousHotkeyScope } from './usePreviousHotkeyScope';
import { useAtom } from 'jotai';
import { pendingHotkeyState } from '../states/internal/pendingHotkeyState';
import { useHotkeys } from 'react-hotkeys-hook';
import { useScopedHotKeysCallback } from './useScopedHotKeysCallback';
import { isDefined } from 'erxes-ui/utils/isDefined';

export const useSequenceHotkeys = (
  firstKey: Keys,
  secondKey: Keys,
  sequenceCallback: () => void,
  scope: string,
  options: Options = {
    enableOnContentEditable: true,
    enableOnFormTags: true,
    preventDefault: true,
  },
  deps: any[] = [],
) => {
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();
  const callScopedHotkeyCallback = useScopedHotKeysCallback();
  const [pendingHotkey, setPendingHotkey] = useAtom(pendingHotkeyState);

  useHotkeys(
    firstKey,
    (keyboardEvent, hotkeysEvent) => {
      callScopedHotkeyCallback({
        keyboardEvent,
        hotkeysEvent,
        callback: () => {
          setPendingHotkey(firstKey);
        },
        scope,
        preventDefault: !!options.preventDefault,
      });
    },
    {
      enableOnContentEditable: options.enableOnContentEditable,
      enableOnFormTags: options.enableOnFormTags,
    },
    [setPendingHotkey, scope],
  );

  useHotkeys(
    secondKey,
    (keyboardEvent, hotkeysEvent) => {
      callScopedHotkeyCallback({
        keyboardEvent,
        hotkeysEvent,
        callback: () => {
          if (pendingHotkey !== firstKey) {
            return;
          }

          setPendingHotkey(null);

          if (isDefined(options.preventDefault)) {
            keyboardEvent.stopImmediatePropagation();
            keyboardEvent.stopPropagation();
            keyboardEvent.preventDefault();
          }

          sequenceCallback();
        },
        scope,
        preventDefault: !!options.preventDefault,
      });
    },
    {
      enableOnContentEditable: options.enableOnContentEditable,
      enableOnFormTags: options.enableOnFormTags,
    },
    [pendingHotkey, setPendingHotkey, scope, ...deps],
  );
  return {
    goBackToPreviousHotkeyScope,
  };
};
