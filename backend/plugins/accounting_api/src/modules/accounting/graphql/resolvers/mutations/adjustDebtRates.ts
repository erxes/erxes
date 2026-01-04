import { IContext } from '~/connectionResolvers';

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
    _root,
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
    _root,
    { _id, ...doc }: { _id: string } & IAdjustDebtRateInput,
    { models, user }: IContext,
  ) {
    await models.AdjustDebtRates.getAdjustDebtRate(_id);

    const updated = await models.AdjustDebtRates.updateAdjustDebtRate(_id, {
      ...doc,
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
    _root,
    { adjustDebtRateIds }: { adjustDebtRateIds: string[] },
    { models }: IContext,
  ) {
    for (const _id of adjustDebtRateIds) {
      await models.AdjustDebtRates.removeAdjustDebtRate(_id);
    }

    return { status: 'ok' };
  },
};

export default adjustDebtRateMutations;
