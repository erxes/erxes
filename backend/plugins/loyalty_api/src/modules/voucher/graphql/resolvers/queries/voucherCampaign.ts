import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/modules/campaign/constants';

import {
  IVoucherCampaign,
  IVoucherCampaignParams,
} from '@/voucher/@types/voucherCampaign';

const generateFilter = async (
  models: IContext['models'],
  params: IVoucherCampaignParams,
): Promise<FilterQuery<IVoucherCampaign>> => {
  const filter: FilterQuery<IVoucherCampaign> = {};

  const {
    searchValue,
    status,
    voucherType,
    equalTypeCampaignId,
    _ids,
  } = params || {};

  if (equalTypeCampaignId) {
    const campaign = await models.VoucherCampaign.findOne({
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

/* -------------------- queries -------------------- */

export const voucherCampaignQueries = {
  getVoucherCampaigns: async (
    _parent: undefined,
    params: IVoucherCampaignParams,
    { models }: IContext,
  ) => {
    const filter = await generateFilter(models, params);

    return cursorPaginate({
      // 👇 THIS IS THE FIX
      model: models.VoucherCampaign as any,
      params,
      query: filter,
    });
  },

  getVoucherCampaignDetail: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.VoucherCampaign.getVoucherCampaign(_id);
  },

  getCpVoucherCampaigns: async (
    _parent: undefined,
    _args: unknown,
    { models }: IContext,
  ) => {
    const now = new Date();

    return models.VoucherCampaign.find({
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ modifiedAt: -1 })
      .lean();
  },
};
