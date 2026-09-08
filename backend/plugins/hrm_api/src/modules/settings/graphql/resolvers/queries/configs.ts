import { IContext } from '~/connectionResolvers';
import { HrmConfigValue } from '../../../@types/config';

export const configQueries = {
  async hrmConfigDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    return models.Configs.getConfigDetail(_id);
  },

  async hrmConfig(
    _root: undefined,
    { code, subId }: { code: string; subId?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    return models.Configs.getConfig(code, subId);
  },

  async hrmConfigs(
    _root: undefined,
    { code }: { code: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    return models.Configs.getConfigs(code);
  },

  async hrmConfigsCount(
    _root: undefined,
    { code }: { code: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    return models.Configs.find({ code }).countDocuments();
  },

  async hrmConfigsByCode(
    _root: undefined,
    { codes }: { codes: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');

    const configs = await models.Configs.find({
      code: { $in: codes },
      subId: '',
    }).lean();

    const result: Record<string, HrmConfigValue | undefined> = {};

    for (const code of codes) {
      result[code] = configs.find((config) => config.code === code)?.value;
    }

    return result;
  },
};
