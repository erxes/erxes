import { IContext } from '~/connectionResolvers';
import {
  calculateAdjustDebtRate,
  runAdjustDebtRate,
} from '../../../utils/adjustDebtRates';

interface IAdjustDebtRateInput {
  date: Date;
  mainCurrency: string;
  currency: string;
  customerType?: string;
  customerId?: string;
  description?: string;
  spotRate: number;
  gainAccountId: string;
  lossAccountId: string;
  branchId?: string;
  departmentId?: string;
}

const adjustDebtRateMutations = {
  /**
   * Creates a new adjust debt rate
   * @param {Object} doc AdjustDebtRate document
   */
  async adjustDebtRatesAdd(
    _root: unknown,
    doc: IAdjustDebtRateInput,
    { models, user }: IContext,
  ) {
    const adjustDebtRate = await models.AdjustDebtRates.createAdjustDebtRate({
      ...doc,
      createdBy: user._id,
    });

    return adjustDebtRate;
  },

  /**
   * Edits an adjust debt rate
   * @param {string} _id AdjustDebtRate id
   * @param {Object} doc AdjustDebtRate info
   */
  async adjustDebtRatesEdit(
    _root: unknown,
    { _id, ...doc }: { _id: string } & IAdjustDebtRateInput,
    { models, user }: IContext,
  ) {
    const adjust = await models.AdjustDebtRates.getAdjustDebtRate(_id);

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

    const updated = await models.AdjustDebtRates.updateAdjustDebtRate(_id, {
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
   * Removes adjust debt rates
   * @param {string[]} adjustDebtRateIds AdjustDebtRate ids
   */
  async adjustDebtRatesRemove(
    _root: unknown,
    { adjustDebtRateIds }: { adjustDebtRateIds: string[] },
    { models }: IContext,
  ) {
    for (const _id of adjustDebtRateIds) {
      await models.AdjustDebtRates.removeAdjustDebtRate(_id);
    }

    return { status: 'ok' };
  },

  async adjustDebtRateCalculate(
    _root: unknown,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAdjustInventories');

    const adjust = await models.AdjustDebtRates.getAdjustDebtRate(_id);

    return calculateAdjustDebtRate(models, user._id, adjust);
  },

  async adjustDebtRateDoTransaction(
    _root: unknown,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAdjustInventories');
    await checkPermission('manageTransactions');

    const adjust = await models.AdjustDebtRates.getAdjustDebtRate(_id);

    return runAdjustDebtRate(models, user._id, adjust);
  },
};

export default adjustDebtRateMutations;
