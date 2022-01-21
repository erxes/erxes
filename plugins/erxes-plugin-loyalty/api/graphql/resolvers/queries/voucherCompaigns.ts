import { paginate } from 'erxes-api-utils'

const generateFilter = async (models, params) => {
  const filter: any = {};

  if (params.equalTypeCompaignId) {
    const compaign = await models.VoucherCompaigns.findOne({ _id: params.equalTypeCompaignId }).lean();
    if (compaign) {
      filter.voucherType = compaign.voucherType;
    }
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
}

export default [
  {
    name: 'voucherCompaigns',
    handler: async (_root, params, { models, checkPermission, user }) => {
      const filter = await generateFilter(models, params)

      return paginate(
        models.VoucherCompaigns.find(
          filter
        ).sort({ modifiedAt: -1 }),
        {
          page: params.page,
          perPage: params.perPage
        }
      )
    }
  },
  {
    name: 'voucherCompaignDetail',
    handler: async (_root, { _id }, { models, checkPermission, user }) => {
      return models.VoucherCompaigns.getVoucherCompaign(models, _id)
    }
  },
  {
    name: 'voucherCompaignsCount',
    handler: async (_root, params, { models, checkPermission, user }) => {
      const filter = await generateFilter(models, params);

      return models.VoucherCompaigns.find(
        filter
      ).countDocuments();
    }
  }
]