import * as dotenv from 'dotenv';
import { IContext } from '~/connectionResolvers';

dotenv.config();

const configQueries = {
  accountingsConfigDetail: async (_root, { _id }: { _id: string }, { models }: IContext) => {
    return await models.Configs.getConfigDetail(_id)
  },

  accountingsConfig: async (_root, { code, subId }: { code: string, subId?: string }, { models }: IContext) => {
    return await models.Configs.getConfig(code, subId)
  },

  accountingsConfigs: async (_root, { code }: { code: string }, { models }: IContext) => {
    return await models.Configs.getConfigs(code);
  },

  accountingsConfigsCount: async (_root, code: string, { models }: IContext) => {
    return await models.Configs.find({ code }).countDocuments();
  },

  async accountingsConfigsByCode(_root, params: { codes: string[] }, { models }: IContext) {
    // TODO: remove code, like migration
    await models.Configs.updateMany({ subId: { $exists: false } }, { $set: { subId: '' } });

    const { codes } = params;

    const configs = await models.Configs.find({
      code: { $in: codes },
      subId: ''
    }).lean();

    const result: any = {};

    for (const code of codes) {
      result[code] = configs.find(c => c.code === code)?.value;
    }

    return result;
  }
};

// moduleRequireLogin(configQueries);

export default configQueries;
