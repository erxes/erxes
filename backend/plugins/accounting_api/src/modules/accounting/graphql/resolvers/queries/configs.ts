import * as dotenv from 'dotenv';
import { IContext } from '~/connectionResolvers';

dotenv.config();

const configQueries = {
  /**
   * AccountingConfig object
   */
  async accountingsConfigs(_root, _args, { models }: IContext) {
    return models.AccountingConfigs.find({});
  },

  async accountingsConfigsByCode(_root, params: { codes: string[] }, { models }: IContext) {
    const { codes } = params
    return models.AccountingConfigs.getConfigs(codes);
  },
};

// moduleRequireLogin(configQueries);

export default configQueries;
