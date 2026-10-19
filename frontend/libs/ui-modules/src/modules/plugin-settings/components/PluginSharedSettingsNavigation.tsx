import { pluginSettingsSlotsState } from '../states/pluginSettingsSlotsState';
import { useAtomValue } from 'jotai';

/**
 * Tags / Properties entries for a plugin's settings sidebar — shown only
 * when the plugin registers tag or property types and the user may manage
 * them. Renders nothing on a host that does not provide them.
 */
export const PluginSharedSettingsNavigation = ({
  pluginName,
  pathPrefix,
}: {
  pluginName: string;
  /** Settings base without a leading slash, e.g. `sales/settings`. */
  pathPrefix: string;
}) => {
  const { navigation: Navigation } = useAtomValue(pluginSettingsSlotsState);

  return Navigation ? (
    <Navigation pluginName={pluginName} pathPrefix={pathPrefix} />
  ) : null;
};
