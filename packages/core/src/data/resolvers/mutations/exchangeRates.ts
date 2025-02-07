import { checkPermission } from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';
import { IExchangeRate } from '../../../db/models/definitions/exchangeRate';

interface IExchangeRateEdit extends IExchangeRate {
  _id: string;
}

const exchangeRateMutations = {
  /**
   * Creates a new exchange rate
   * @param {Object} doc ExchangeRate document
   */
  async exchangeRateAdd(
    _root,
    doc: IExchangeRate,
    { docModifier, models }: IContext
  ) {
    const exchangeRate = await models.ExchangeRates.createExchangeRate(
      docModifier({ ...doc, createdAt: new Date() })
    );

    return exchangeRate;
  },

  /**
   * Edits a exchange rate
   * @param {string} param2._id ExchangeRate id
   * @param {Object} param2.doc ExchangeRate info
   */
  async exchangeRateEdit(
    _root,
    { _id, ...doc }: IExchangeRateEdit,
    { models }: IContext
  ) {
    const updated = await models.ExchangeRates.updateExchangeRate(_id, {
      ...doc,
      modifiedAt: new Date(),
    });

    return updated;
  },

  /**
   * Removes a exchange rate
   * @param {string} param1._id ExchangeRate id
   */
  async exchangeRatesRemove(
    _root,
    { rateIds }: { rateIds: string[] },
    { models }: IContext
  ) {
    const response = await models.ExchangeRates.removeExchangeRates(rateIds);

    return response;
  },
};

checkPermission(
  exchangeRateMutations,
  'exchangeRateAdd',
  'manageExchangeRates'
);
checkPermission(
  exchangeRateMutations,
  'exchangeRateEdit',
  'manageExchangeRates'
);
checkPermission(
  exchangeRateMutations,
  'exchangeRatesRemove',
  'manageExchangeRates'
);

export default exchangeRateMutations;
