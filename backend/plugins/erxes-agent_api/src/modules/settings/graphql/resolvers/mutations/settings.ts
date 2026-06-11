import { IContext } from '~/connectionResolvers';
import { IMastraSettings } from '@/settings/@types/settings';

/** Mutations for the plugin-wide Mastra settings document. */
export const settingsMutations = {
  mastraSettingsSave: (
    _parent: undefined,
    { doc }: { doc: IMastraSettings },
    { models }: IContext,
  ) => {
    return models.MastraSettings.saveSettings(doc);
  },
};
