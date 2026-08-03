import { IContext } from '~/connectionResolvers';
import {
  IAdjustFixedAsset,
  ADJ_FXA_STATUSES,
} from '@/accounting/@types/adjustFixedAsset';
import {
  cancelAdjustFixedAsset,
  checkValidFixedAssetDate,
  clearAdjustFixedAsset,
  createAdjustFixedAssetTransaction,
  publishAdjustFixedAsset,
  runAdjustFixedAsset,
} from '../../../utils/adjustFixedAssets';

export const AdjustFixedAssets = {
  async adjustFixedAssetAdd(
    _root: undefined,
    doc: IAdjustFixedAsset,
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('manageAdjustInventories');

    const { beginDate } = await checkValidFixedAssetDate(models, {
      _id: '',
      date: doc.date,
    });

    return models.AdjustFixedAssets.createAdjustFixedAsset({
      ...doc,
      beginDate,
      createdBy: user._id,
    });
  },

  async adjustFixedAssetRemove(
    _root: undefined,
    { adjustId }: { adjustId: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('removeAdjustInventories');

    return models.AdjustFixedAssets.removeAdjustFixedAsset(adjustId);
  },

  async adjustFixedAssetPublish(
    _root: undefined,
    { adjustId }: { adjustId: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('publishAdjustInventories');

    const adjust = await models.AdjustFixedAssets.getAdjustFixedAsset(adjustId);

    return publishAdjustFixedAsset(models, user._id, adjust);
  },

  async adjustFixedAssetCancel(
    _root: undefined,
    { adjustId }: { adjustId: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('cancelAdjustInventories');

    const adjust = await models.AdjustFixedAssets.getAdjustFixedAsset(adjustId);

    return cancelAdjustFixedAsset(models, user._id, adjust);
  },

  async adjustFixedAssetClear(
    _root: undefined,
    { adjustId }: { adjustId: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('clearAdjustInventories');

    const adjust = await models.AdjustFixedAssets.getAdjustFixedAsset(adjustId);

    return clearAdjustFixedAsset(models, user._id, adjust);
  },

  async adjustFixedAssetRun(
    _root: undefined,
    { adjustId }: { adjustId: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAdjustInventories');

    const adjust = await models.AdjustFixedAssets.getAdjustFixedAsset(adjustId);

    if (
      [ADJ_FXA_STATUSES.RUNNING, ADJ_FXA_STATUSES.PUBLISH].includes(
        adjust.status,
      )
    ) {
      throw new Error('This fixed asset adjustment cannot be calculated.');
    }

    await models.AdjustFixedAssets.updateAdjustFixedAsset(adjustId, {
      status: ADJ_FXA_STATUSES.RUNNING,
      error: '',
      warning: '',
      modifiedBy: user._id,
    });

    return runAdjustFixedAsset(models, user._id, adjust);
  },

  async adjustFixedAssetTransaction(
    _root: undefined,
    {
      adjustId,
      expenseAccountId,
    }: { adjustId: string; expenseAccountId: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAdjustInventories');
    await checkPermission('manageTransactions');

    const adjust = await models.AdjustFixedAssets.getAdjustFixedAsset(adjustId);

    if (adjust.status !== ADJ_FXA_STATUSES.PROCESS) {
      throw new Error('Calculate depreciation before creating transaction.');
    }

    if (adjust.error) {
      throw new Error(
        'Resolve depreciation errors before creating transaction.',
      );
    }

    return createAdjustFixedAssetTransaction({
      models,
      userId: user._id,
      adjust,
      expenseAccountId,
    });
  },
};
