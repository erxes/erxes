import { IContext } from '~/connectionResolvers';

export const settingsQueries = {
  mastraSettings: async (_: any, __: any, { models }: IContext) => {
    return models.MastraSettings.getSettings();
  },
};
