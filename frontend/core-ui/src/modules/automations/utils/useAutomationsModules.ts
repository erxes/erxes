import { pluginsConfigState } from 'ui-modules';
import { useAtom } from 'jotai';

export const useAutomationsRemoteModules = (pluginName: string) => {
  const [pluginsMetaData] = useAtom(pluginsConfigState);

  if (!pluginsMetaData) {
    return { isEnabled: false };
  }

  const plugins = Object.values(pluginsMetaData);

  // Module-federation container names can't contain dashes, so a dashed plugin
  // name (e.g. "erxes-agent") is registered — and stored in pluginsConfigState —
  // in its underscore form ("erxes_agent"). Automation node types keep the real
  // dashed name, so normalize before matching. Mirrors core-api's
  // get-frontend-plugins `remoteName()`.
  const normalizedName = pluginName.replace(/-/g, '_');

  const result = plugins
    .filter(({ name }) => name === normalizedName)
    .flatMap((plugin) =>
      (plugin.modules || [])
        .filter((module) => module.hasAutomation)
        .map((module) => ({
          ...module,
          pluginName: plugin.name,
        })),
    );
  return { isEnabled: !!result?.length };
};
