import { ChannelHotKeyScope } from '@/channels/types';
import { usePreviousHotkeyScope, useScopedHotkeys } from 'erxes-ui';
import { useEffect } from 'react';
import { useSidePanel } from 'ui-modules';

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
