import * as dotenv from 'dotenv';
import * as moment from 'moment';
import { IContext } from '../../../connectionResolver';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

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

  async accountingsGetRate(_root, args: { currency: string, date: Date }, { models }: IContext) {
    const { date, currency } = args;
    const mainCurrency = await models.AccountingConfigs.getConfig('MainCurrency', 'MNT');

    return await models.ExchangeRates.findOne({ mainCurrency, rateCurrency: currency, date: moment(date).format('YYYY-MM-DD') }).lean()
  }
};

moduleRequireLogin(configQueries);

export default configQueries;
