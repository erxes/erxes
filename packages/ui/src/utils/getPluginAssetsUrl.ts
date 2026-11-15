import { getInstance } from '@module-federation/enhanced/runtime';

/**
 * A file's URL in a plugin UI's deployed `assets` folder.
 * `getPluginAssetsUrl('hr', 'logo.svg')` resolves next to the `hr_ui` remote entry. For a plugin
 * web hasn't registered, it returns `url` unchanged.
 */
export const getPluginAssetsUrl = (pluginName: string, url: string) => {
  const instance = getInstance();
  const remotes = instance?.options.remotes;

  const remote = remotes?.find((r) => r.name === `${pluginName}_ui`);

  if (remote && 'entry' in remote && typeof remote.entry === 'string') {
    const assetsUrl = remote.entry.replace('remoteEntry.js', 'assets');

    return `${assetsUrl}/${url}`;
  }

  return url;
};
