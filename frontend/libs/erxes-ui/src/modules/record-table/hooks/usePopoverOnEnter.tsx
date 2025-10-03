import {
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui/modules/hotkey';
import { Key } from 'erxes-ui/types';

export const usePopoverOnEnter = (
  scope: string,
  onEnter: () => void,
  dependencies: any[],
) => {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  useScopedHotkeys(
    Key.Enter,
    () => {
      onEnter?.();
      goBackToPreviousHotkeyScope();
    },
    scope + '.Popover',
    dependencies,
    {
      preventDefault: false,
    },
  );

  const scopeHandleOnOpenChange = (open: boolean) =>
    open
      ? setHotkeyScopeAndMemorizePreviousScope(scope + '.Popover')
      : goBackToPreviousHotkeyScope();

  return {
    scopeHandleOnOpenChange,
  };
};
