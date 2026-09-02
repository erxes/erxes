import { IContext } from '~/connectionResolvers';
import {
  calculateAdjustFundRate,
  runAdjustFundRate,
} from '../../../utils/adjustFundRates';

interface IAdjustFundRateInput {
  date: Date;
  mainCurrency: string;
  currency: string;
  description?: string;
  spotRate: number;
  gainAccountId: string;
  lossAccountId: string;
}

const adjustFundRateMutations = {
  /**
   * Creates a new adjust fund rate
   * @param {Object} doc AdjustFundRate document
   */
  async adjustFundRateAdd(
    _root: unknown,
    doc: IAdjustFundRateInput,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAdjustFundRates');

    const adjustFundRate = await models.AdjustFundRates.createAdjustFundRate({
      ...doc,
      createdBy: user._id,
    });

    return adjustFundRate;
  },

  /**
   * Edits an adjust fund rate
   * @param {string} _id AdjustFundRate id
   * @param {Object} doc AdjustFundRate info
   */
  async adjustFundRateChange(
    _root: unknown,
    { _id, ...doc }: { _id: string } & IAdjustFundRateInput,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAdjustFundRates');

    const adjust = await models.AdjustFundRates.getAdjustFundRate(_id);

    if (adjust.transactionId) {
      const oldTransaction = await models.Transactions.findOne({
        parentId: adjust.transactionId,
      }).lean();

      if (oldTransaction) {
        await models.Transactions.removePTransaction({
          parentId: adjust.transactionId,
        });
      }
    }

    const updated = await models.AdjustFundRates.updateAdjustFundRate(_id, {
      ...doc,
      details: [],
      transactionId: '',
      status: 'draft',
      beginDate: undefined,
      successDate: undefined,
      checkedAt: undefined,
      error: '',
      warning: '',
      modifiedBy: user._id,
      updatedAt: new Date(),
    });

    return updated;
  },

  /**
   * Removes adjust fund rates
   * @param {string[]} adjustFundRateIds AdjustFundRate ids
   */
  async adjustFundRateRemove(
    _root: unknown,
    { adjustFundRateIds }: { adjustFundRateIds: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('removeAdjustFundRates');

    for (const _id of adjustFundRateIds) {
      await models.AdjustFundRates.removeAdjustFundRate(_id);
    }

    return { status: 'ok' };
  },

  async adjustFundRateCalculate(
    _root: unknown,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAdjustFundRates');

    const adjust = await models.AdjustFundRates.getAdjustFundRate(_id);

    return calculateAdjustFundRate(models, user._id, adjust);
  },

  async adjustFundRateDoTransaction(
    _root: unknown,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAdjustFundRates');

    const adjust = await models.AdjustFundRates.getAdjustFundRate(_id);

    return runAdjustFundRate(models, user._id, adjust);
  },

  async adjustFundRateRun(
    _root: unknown,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAdjustFundRates');

    const adjust = await models.AdjustFundRates.getAdjustFundRate(_id);

    return runAdjustFundRate(models, user._id, adjust);
  },
};

export default adjustFundRateMutations;
