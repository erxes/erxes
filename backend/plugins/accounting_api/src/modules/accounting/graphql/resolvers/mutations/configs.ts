import { IContext } from '~/connectionResolvers';

const configMutations = {
  async accountingsConfigsCreate(
    _root,
    { code, value, subId }: { code: string; value: any; subId?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccountingConfigs');
    return await models.Configs.createConfig({ code, subId, value });
  },

  async accountingsConfigsUpdate(
    _root,
    { _id, value, subId }: { _id: string; value: any; subId?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccountingConfigs');
    return await models.Configs.updateConfig(_id, value, subId);
  },

  async accountingsConfigsRemove(
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('removeAccountingConfigs');
    return await models.Configs.removeConfig(_id);
  },

  async accountingsConfigsUpdateByCode(
    _root,
    { configsMap }: { configsMap: any },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccountingConfigs');
    const codes = Object.keys(configsMap);

    for (const code of codes) {
      if (!code) {
        continue;
      }

      const value = configsMap[code];

      await models.Configs.updateSingleByCode(code, value);
    }

    return models.Configs.find({ code: { $in: codes }, subId: '' });
  },
};

export default configMutations;
