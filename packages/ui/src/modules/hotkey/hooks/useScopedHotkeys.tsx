import { useAtom } from 'jotai';
import { useHotkeys } from 'react-hotkeys-hook';
import type { HotkeyCallback, Keys, Options } from 'react-hotkeys-hook/dist/types';
import { pendingHotkeyState } from '../states/internal/pendingHotkeyState';
import { useScopedHotKeysCallback } from './useScopedHotKeysCallback';

export type UseHotkeysOptionsWithoutBuggyOptions = Omit<Options, 'enabled'>;

export const useScopedHotkeys = (
  keys: Keys,
  callback: HotkeyCallback,
  scope: string,
  dependencies?: unknown[],
  options?: UseHotkeysOptionsWithoutBuggyOptions,
) => {
  const [pendingHotkey, setPendingHotkey] = useAtom(pendingHotkeyState);

  const callScopedHotkeyCallback = useScopedHotKeysCallback();

  const enableOnContentEditable = options?.enableOnContentEditable ?? true;
  const enableOnFormTags = options?.enableOnFormTags ?? false;
  const preventDefault = (options?.preventDefault ?? true) === true;
  const ignoreModifiers = options?.ignoreModifiers ?? false;

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
