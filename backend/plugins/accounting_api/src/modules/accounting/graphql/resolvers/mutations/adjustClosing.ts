import { IContext } from '~/connectionResolvers';
import { IAdjustClosing } from '~/modules/accounting/@types/adjustClosingEntry';
import {
  calculateAdjustClosing,
  runAdjustClosingTransactions,
} from '~/modules/accounting/utils/adjustClosings';

const adjustClosingEntryMutations = {
  /**
   * Creates a new adjust closing
   */

  async adjustClosingAdd(
    _root: undefined,
    doc: IAdjustClosing,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAdjustClosings');

    return await models.AdjustClosings.createAdjustClosing({
      ...doc,
      createdBy: user?._id || '',
    });
  },

  /**
   * Edits a adjust closing
   */
  async adjustClosingEdit(
    _root: undefined,
    {
      _id,
      ...doc
    }: {
      _id: string;
      detailId?: string;
      entryId?: string;
    } & Partial<IAdjustClosing>,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('manageAdjustClosings');

    await models.AdjustClosings.getAdjustClosing({ _id });
    return await models.AdjustClosings.updateAdjustClosing(_id, {
      ...doc,
    });
  },

  /**
   * Removes a adjust closing
   */
  async adjustClosingRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('removeAdjustClosings');

    const response = await models.AdjustClosings.removeAdjustClosing(_id);
    return response;
  },

  async adjustClosingPublish(
    _root: undefined,
    { adjustId }: { adjustId: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('publishAdjustClosings');

    return models.AdjustClosings.publishAdjustClosing(adjustId);
  },

  async adjustClosingCancel(
    _root: undefined,
    { adjustId }: { adjustId: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('cancelAdjustClosings');

    const closing = await models.AdjustClosings.getAdjustClosing({
      _id: adjustId,
    });

    if (closing.status !== 'publish') {
      throw new Error('Only published Adjust Closing can be cancelled');
    }

    return models.AdjustClosings.updateAdjustClosing(adjustId, {
      status: 'complete',
      modifiedBy: user?._id || '',
    });
  },

  async adjustClosingCalculate(
    _root: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAdjustClosings');

    const closing = await models.AdjustClosings.getAdjustClosing({ _id });

    if (closing.status === 'publish') {
      throw new Error('Published Adjust Closing cannot be calculated');
    }

    return calculateAdjustClosing(models, user?._id || '', closing);
  },

  async adjustClosingDoTransaction(
    _root: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAdjustClosings');
    await checkPermission('manageMainTransactions');

    const closing = await models.AdjustClosings.getAdjustClosing({ _id });

    if (closing.status === 'publish') {
      throw new Error('Published Adjust Closing cannot be run');
    }

    if (closing.error) {
      throw new Error(closing.error);
    }

    return runAdjustClosingTransactions(models, user?._id || '', closing);
  },

  async adjustClosingRun(
    _root: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAdjustClosings');

    const closing = await models.AdjustClosings.getAdjustClosing({ _id });
    return calculateAdjustClosing(models, user?._id || '', closing);
  },
};

export default adjustClosingEntryMutations;
