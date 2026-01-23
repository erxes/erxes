import { IContext } from '~/connectionResolvers';

interface IAdjustFundRateInput {
  date: Date;
  mainCurrency: string;
  currency: string;
  description?: string;
  spotRate: number;
  gainAccountId: string;
  lossAccountId: string;
  branchId?: string;
  departmentId?: string;
}

const adjustFundRateMutations = {
  /**
   * Creates a new adjust fund rate
   * @param {Object} doc AdjustFundRate document
   */
  async adjustFundRateAdd(
    _root,
    doc: IAdjustFundRateInput,
    { models, user }: IContext,
  ) {
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
    _root,
    { _id, ...doc }: { _id: string } & IAdjustFundRateInput,
    { models, user }: IContext,
  ) {
    await models.AdjustFundRates.getAdjustFundRate(_id);

    const updated = await models.AdjustFundRates.updateAdjustFundRate(_id, {
      ...doc,
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
    _root,
    { adjustFundRateIds }: { adjustFundRateIds: string[] },
    { models }: IContext,
  ) {
    for (const _id of adjustFundRateIds) {
      await models.AdjustFundRates.removeAdjustFundRate(_id);
    }

    return { status: 'ok' };
  },
};

export default adjustFundRateMutations;
