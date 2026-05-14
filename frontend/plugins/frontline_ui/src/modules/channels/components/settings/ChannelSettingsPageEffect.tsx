import { useEffect } from 'react';
import { ChannelHotKeyScope } from '@/channels/types';
import { PipelineHotkeyScope } from '@/pipelines/types';
import { ResponseHotkeyScope } from '@/responseTemplate/types/ResponseHotkeyScope';
import { useIsMatchingLocation, useSetHotkeyScope } from 'erxes-ui';
import { FrontlinePaths } from '@/types/FrontlinePaths';

export const ChannelSettingsPageEffect = () => {
  const isMatchingLocation = useIsMatchingLocation(
    '/settings/frontline/channels',
  );
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    switch (true) {
      case isMatchingLocation(FrontlinePaths.PipelineDetail): {
        setHotkeyScope(PipelineHotkeyScope.PipelineDetail);
        break;
      }
      case isMatchingLocation(FrontlinePaths.ResponseDetail): {
        setHotkeyScope(ResponseHotkeyScope.ResponseDetail);
        break;
      }
      case isMatchingLocation(FrontlinePaths.ChannelMembers): {
        setHotkeyScope(ChannelHotKeyScope.ChannelMembersPage);
        break;
      }
      case isMatchingLocation(FrontlinePaths.ChannelPipelines): {
        setHotkeyScope(PipelineHotkeyScope.PipelineSettingsPage);
        break;
      }
      case isMatchingLocation(FrontlinePaths.ChannelResponsePage): {
        setHotkeyScope(ResponseHotkeyScope.ResponseSettingsPage);
        break;
      }
      case isMatchingLocation(FrontlinePaths.ChannelIntegrations): {
        setHotkeyScope(ChannelHotKeyScope.ChannelIntegrationsPage);
        break;
      }
      case isMatchingLocation(FrontlinePaths.ChannelDetails): {
        setHotkeyScope(ChannelHotKeyScope.ChannelDetailPage);
        break;
      }
      default: {
        setHotkeyScope(ChannelHotKeyScope.ChannelSettingsPage);
        break;
      }
    }
  }, [isMatchingLocation, setHotkeyScope]);

  return null;
};
