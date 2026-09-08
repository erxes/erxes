import { IContext } from '~/connectionResolvers';
import { HrmConfigValue } from '../../../@types/config';

export const configMutations = {
  async hrmConfigsCreate(
    _root: undefined,
    {
      code,
      value,
      subId,
    }: { code: string; value?: HrmConfigValue; subId?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsManage');
    return models.Configs.createConfig({ code, subId, value });
  },

  async hrmConfigsUpdate(
    _root: undefined,
    {
      _id,
      value,
      subId,
    }: { _id: string; value?: HrmConfigValue; subId?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsManage');
    return models.Configs.updateConfig(_id, value, subId);
  },

  async hrmConfigsRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsRemove');
    return models.Configs.removeConfig(_id);
  },

  async hrmConfigsUpdateByCode(
    _root: undefined,
    { configsMap }: { configsMap: Record<string, HrmConfigValue> },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsManage');

    const codes = Object.keys(configsMap);

    for (const code of codes) {
      if (code.trim()) {
        await models.Configs.updateSingleByCode(code, configsMap[code]);
      }
    }

    return models.Configs.find({ code: { $in: codes }, subId: '' }).lean();
  },
};
