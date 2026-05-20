import { IContext } from '~/connectionResolvers';

export const mnConfigQueries = {
  mnConfigDetail: async (
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('showMnConfig');
    return await models.Configs.getConfigDetail(_id);
  },

  mnConfig: async (
    _root,
    { code, subId }: { code: string; subId?: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('showMnConfig');
    return await models.Configs.getConfig(code, subId);
  },

  mnConfigs: async (
    _root,
    { code }: { code: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('showMnConfig');
    console.log('mnConfigs called with code:', code);
    const configs = await models.Configs.getConfigs(code);
    console.log('mnConfigs found:', configs.length, 'configs');
    return configs;
  },

  mnConfigsCount: async (
    _root,
    code: string,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('showMnConfig');

    return await models.Configs.find({ code }).countDocuments();
  },
};