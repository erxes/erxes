import * as dotenv from 'dotenv';
import { IContext } from '~/connectionResolvers';
import { validateRequiredId } from '../../validateRequired';

dotenv.config();

const configQueries = {
  accountingsConfigDetail: async (
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('readAccountingConfigs');
    validateRequiredId(_id);
    return await models.Configs.getConfigDetail(_id);
  },

  accountingsConfig: async (
    _root,
    { code, subId }: { code: string; subId?: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('readAccountingConfigs');
    validateRequiredId(code, 'code');
    return await models.Configs.getConfig(code, subId);
  },

  accountingsConfigs: async (
    _root,
    { code }: { code: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('readAccountingConfigs');
    validateRequiredId(code, 'code');
    return await models.Configs.getConfigs(code);
  },

  accountingsConfigsCount: async (
    _root,
    { code }: { code: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('readAccountingConfigs');
    validateRequiredId(code, 'code');
    return await models.Configs.find({ code }).countDocuments();
  },

  async accountingsConfigsByCode(
    _root,
    params: { codes: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readAccountingConfigs');
    const { codes } = params;
    if (!Array.isArray(codes)) throw new Error('codes must be an array');
    for (const code of codes) validateRequiredId(code, 'codes');
    // TODO: remove code, like migration
    await models.Configs.updateMany(
      { subId: { $exists: false } },
      { $set: { subId: '' } },
    );

    const configs = await models.Configs.find({
      code: { $in: codes },
      subId: '',
    }).lean();

    const result: Record<string, unknown> = {};

    for (const code of codes) {
      result[code] = configs.find((c) => c.code === code)?.value;
    }

    return result;
  },
};

export { configQueries };
