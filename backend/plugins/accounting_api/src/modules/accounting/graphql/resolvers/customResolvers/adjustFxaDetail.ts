import { attachPreviousFxaDetails } from '@/accounting/utils/fxaAdjustmentState';
import { IContext } from '~/connectionResolvers';
import {
  IAdjustFxaDetail,
  IAdjustFxaDetailDocument,
} from '~/modules/accounting/@types/adjustFixedAsset';

export const AdjustFxaDetail = {
  async __resolveReference({ _id }: { _id: string }, { models }: IContext) {
    const detail = await models.AdjustFxaDetails.findOne({ _id }).lean();
    if (!detail) return null;
    const [result] = await attachPreviousFxaDetails(models, detail.adjustId, [
      detail,
    ]);
    return result;
  },

  async previous(
    detail: IAdjustFxaDetail & { previous?: IAdjustFxaDetailDocument | null },
    _args: undefined,
    { models }: IContext,
  ) {
    if (detail.previous !== undefined) return detail.previous;
    const [result] = await attachPreviousFxaDetails(models, detail.adjustId, [
      detail,
    ]);
    return result.previous;
  },

  async account(
    detail: IAdjustFxaDetail,
    _args: undefined,
    { models }: IContext,
  ) {
    if (!detail.accountId) {
      return null;
    }

    return models.Accounts.findOne({ _id: detail.accountId }).lean();
  },

  async fixedAsset(
    detail: IAdjustFxaDetail,
    _args: undefined,
    { models }: IContext,
  ) {
    if (!detail.fixedAssetId) {
      return null;
    }

    return models.FixedAssets.findOne({ _id: detail.fixedAssetId }).lean();
  },
};
