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

  async accountingsGetRate(_root, args: { currency: string, date: Date }, { models }: IContext) {
    const { date, currency } = args;
    const mainCurrency = await models.AccountingConfigs.getConfig('MainCurrency', 'MNT');
    console.log(currency, date, typeof moment(date).format('YYYY-MM-DD'), moment(date).format('YYYY-MM-DD'))

    return await models.ExchangeRates.findOne({ mainCurrency, rateCurrency: currency, date: moment(date).format('YYYY-MM-DD') }).lean()
  }
};

moduleRequireLogin(configQueries);

export default configQueries;
