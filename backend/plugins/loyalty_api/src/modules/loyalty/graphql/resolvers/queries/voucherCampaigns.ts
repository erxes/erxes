import { checkPermission } from 'erxes-api-shared/core-modules';
import { paginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ICommonCampaignParams } from '~/modules/loyalty/@types/common';
import { CAMPAIGN_STATUS } from '~/modules/loyalty/@types/constants';

const generateFilter = async (models, params) => {
  const filter: any = {};

  if (params.equalTypeCampaignId) {
    const campaign = await models.VoucherCampaigns.findOne({
      _id: params.equalTypeCampaignId,
    }).lean();
    if (campaign) {
      filter.voucherType = campaign.voucherType;
    }
  }

  if (params._ids) {
    filter._id = params._ids;
  }

  if (params.searchValue) {
    filter.title = new RegExp(params.searchValue);
  }

  if (params.voucherType) {
    filter.voucherType = params.voucherType;
  }

  if (params.filterStatus) {
    filter.status = params.filterStatus;
  }

  return filter;
};

const voucherCampaignQueries = {
  async voucherCampaigns(
    _root,
    params: ICommonCampaignParams & {
      equalTypeCampaignId: string;
      voucherType: string;
      _ids: [string];
    },
    { models }: IContext,
  ) {
    console.log('xaxa');

    const filter = await generateFilter(models, params);

    return paginate(
      models.VoucherCampaigns.find(filter).sort({ modifiedAt: -1 }),
      {
        page: params.page,
        perPage: params.perPage,
      },
    );
  },

  async cpVoucherCampaigns(_root, {}, { models }: IContext) {
    const now = new Date();
    return models.VoucherCampaigns.find({
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ modifiedAt: -1 });
  },

  async voucherCampaignsCount(
    _root,
    params: ICommonCampaignParams,
    { models }: IContext,
  ) {
    const filter = await generateFilter(models, params);

    return models.VoucherCampaigns.find(filter).countDocuments();
  },

  async voucherCampaignDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.VoucherCampaigns.getVoucherCampaign(_id);
  },
};

// checkPermission(voucherCampaignQueries, 'voucherCampaigns', 'showLoyalties');

export default voucherCampaignQueries;
