import { IContext } from '~/connectionResolvers';

export const mnConfigQueries = {
  mnConfigDetail: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return await models.Configs.getConfigDetail(_id);
  },

  mnConfig: async (
    _root,
    { code, subId }: { code: string; subId?: string },
    { models }: IContext,
  ) => {
    return await models.Configs.getConfig(code, subId);
  },

  mnConfigs: async (
    _root,
    { code }: { code: string },
    { models }: IContext,
  ) => {
    console.log('mnConfigs called with code:', code);
    const configs = await models.Configs.getConfigs(code);
    console.log('mnConfigs found:', configs.length, 'configs');
    return configs;
  },

  mnConfigsCount: async (_root, code: string, { models }: IContext) => {
    return await models.Configs.find({ code }).countDocuments();
  },
};
