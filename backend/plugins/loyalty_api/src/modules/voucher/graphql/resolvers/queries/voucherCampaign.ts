import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext, IModels } from '~/connectionResolvers';

import {
  IVoucherCampaign,
  IVoucherCampaignDocument,
  IVoucherCampaignParams,
} from '@/voucher/@types/voucherCampaign';
import { CAMPAIGN_STATUS } from '~/constants';

const generateFilter = async (
  models: IModels,
  params: IVoucherCampaignParams,
): Promise<FilterQuery<IVoucherCampaign>> => {
  const filter: FilterQuery<IVoucherCampaign> = {};

  const { searchValue, status, voucherType, equalTypeCampaignId, _ids } =
    params || {};

  if (equalTypeCampaignId) {
    const campaign = await models.VoucherCampaigns.findOne({
      _id: equalTypeCampaignId,
    }).lean();

    if (campaign?.voucherType) {
      filter.voucherType = campaign.voucherType;
    }
  }

  if (_ids?.length) {
    filter._id = { $in: _ids };
  }

  if (searchValue) {
    filter.title = new RegExp(searchValue, 'i');
  }

  if (voucherType) {
    filter.voucherType = voucherType;
  }

  if (status) {
    filter.status = status;
  }

  return filter;
};

export const voucherCampaignQueries = {
  async voucherCampaigns(
    _root: undefined,
    params: IVoucherCampaignParams,
    { models }: IContext,
  ) {
    const filter = await generateFilter(models, params);

    return cursorPaginate<IVoucherCampaignDocument>({
      model: models.VoucherCampaigns,
      params,
      query: filter,
    });
  },

  async voucherCampaignDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.VoucherCampaigns.getVoucherCampaign(_id);
  },

  async cpVoucherCampaigns(
    _root: undefined,
    _args: unknown,
    { models }: IContext,
  ) {
    const now = new Date();

    return models.VoucherCampaigns.find({
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ modifiedAt: -1 })
      .lean();
  },
};
