import { IContext } from '~/connectionResolvers';

export const settingsMutations = {
  mastraSettingsSave: async (_: any, { doc }: any, { models }: IContext) => {
    return models.MastraSettings.saveSettings(doc);
  },
};
