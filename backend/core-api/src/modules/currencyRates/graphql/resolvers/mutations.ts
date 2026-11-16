import { IContext } from '~/connectionResolvers';
import { ICurrencyRate } from '@/currencyRates/db/definitions/currencyRates';

const PERMISSION = 'exchangeRatesManage';

export const currencyRateMutations = {
  async currencyRateAdd(
    _root: undefined,
    doc: ICurrencyRate,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission(PERMISSION);

    return models.CurrencyRates.createRate(doc, user._id);
  },

  async currencyRateEdit(
    _root: undefined,
    { _id, ...doc }: { _id: string } & Partial<ICurrencyRate>,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission(PERMISSION);

    return models.CurrencyRates.updateRate(_id, doc);
  },

  async currencyRatesRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission(PERMISSION);

    return models.CurrencyRates.removeRates(_ids);
  },
};
