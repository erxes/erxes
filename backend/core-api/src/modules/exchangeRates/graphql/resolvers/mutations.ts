import { IContext } from "~/connectionResolvers";
import { IExchangeRate } from "../../@types/exchangeRate";

export const exchangeRateMutations = {
  /**
   * Creates a new exchange rate
   * @param {Object} doc ExchangeRate document
   */
  async exchangeRateAdd(
    _root,
    doc: IExchangeRate,
    { models }: IContext
  ) {
    return await models.ExchangeRates.createExchangeRate({
      ...doc, createdAt: new Date()
    });
  },

  /**
   * Edits a exchange rate
   * @param {string} param2._id ExchangeRate id
   * @param {Object} param2.doc ExchangeRate info
   */
  async exchangeRateEdit(
    _root,
    { _id, ...doc }: IExchangeRate & { _id: string },
    { models }: IContext
  ) {
    return await models.ExchangeRates.updateExchangeRate(_id, {
      ...doc,
      modifiedAt: new Date(),
    });
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
    return await models.ExchangeRates.removeExchangeRates(rateIds);
  },
};

// checkPermission( exchangeRateMutations, 'exchangeRateAdd', 'manageExchangeRates' );
// checkPermission( exchangeRateMutations, 'exchangeRateEdit', 'manageExchangeRates' );
// checkPermission( exchangeRateMutations, 'exchangeRatesRemove', 'manageExchangeRates' );
