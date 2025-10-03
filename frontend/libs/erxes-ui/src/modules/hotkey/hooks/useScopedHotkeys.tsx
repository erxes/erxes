import { useAtom } from 'jotai';
import { HotkeyCallback, Options } from 'react-hotkeys-hook/dist/types';
import { Keys } from 'react-hotkeys-hook/dist/types';
import { pendingHotkeyState } from '../states/internal/pendingHotkeyState';
import { useScopedHotKeysCallback } from './useScopedHotKeysCallback';
import { isDefined } from 'erxes-ui/utils/isDefined';
import { useHotkeys } from 'react-hotkeys-hook';

export type UseHotkeysOptionsWithoutBuggyOptions = Omit<Options, 'enabled'>;

export const useScopedHotkeys = (
  keys: Keys,
  callback: HotkeyCallback,
  scope: string,
  dependencies?: unknown[],
  options?: UseHotkeysOptionsWithoutBuggyOptions,
) => {
  const [pendingHotkey, setPendingHotkey] = useAtom(pendingHotkeyState);

  const callScopedHotkeyCallback = useScopedHotKeysCallback(dependencies);

  const enableOnContentEditable = isDefined(options?.enableOnContentEditable)
    ? options.enableOnContentEditable
    : true;

  const enableOnFormTags = isDefined(options?.enableOnFormTags)
    ? options.enableOnFormTags
    : true;

  const preventDefault = isDefined(options?.preventDefault)
    ? options.preventDefault === true
    : true;

  const ignoreModifiers = isDefined(options?.ignoreModifiers)
    ? options.ignoreModifiers === true
    : false;

  return useHotkeys(
    keys,
    (keyboardEvent, hotkeysEvent) =>
      callScopedHotkeyCallback({
        keyboardEvent,
        hotkeysEvent,
        callback: () => {
          if (!pendingHotkey) {
            callback(keyboardEvent, hotkeysEvent);
            return;
          }
          setPendingHotkey(null);
        },
        scope,
        preventDefault,
      }),
    {
      enableOnContentEditable,
      enableOnFormTags,
      ignoreModifiers,
      ...options,
    },
    dependencies,
  );
};
