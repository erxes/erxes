import { ChannelHotKeyScope } from '@/channels/types';
import { usePreviousHotkeyScope, useScopedHotkeys } from 'erxes-ui';
import { useEffect } from 'react';
import { useSidePanel } from 'ui-modules';

/** Installs panel shortcuts and restores the previous scope on unmount. */
export const useChannelPanelHotkeys = (): void => {
  const { close } = useSidePanel();
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  useEffect(() => {
    setHotkeyScopeAndMemorizePreviousScope(ChannelHotKeyScope.ChannelAddSheet);
    return goBackToPreviousHotkeyScope;
  }, [setHotkeyScopeAndMemorizePreviousScope, goBackToPreviousHotkeyScope]);
  useScopedHotkeys('esc', close, ChannelHotKeyScope.ChannelAddSheet);
};
