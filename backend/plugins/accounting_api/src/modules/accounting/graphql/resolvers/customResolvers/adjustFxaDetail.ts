import { IContext } from '~/connectionResolvers';
import { IAdjustFxaDetail } from '~/modules/accounting/@types/adjustFixedAsset';

export const AdjustFxaDetail = {
  __resolveReference({ _id }: { _id: string }, { models }: IContext) {
    return models.AdjustFxaDetails.findOne({ _id });
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
