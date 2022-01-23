import { paginate } from 'erxes-api-utils'

const generateFilter = async (models, params) => {
  const filter: any = {};

  if (params.searchValue) {
    filter.title = new RegExp(params.searchValue);
  }

  if (params.filterStatus) {
    filter.status = params.filterStatus;
  }

  return filter;
}

export default [
  {
    name: 'lotteryCompaigns',
    handler: async (_root, params, { models, checkPermission, user }) => {
      const filter = await generateFilter(models, params)

      return paginate(
        models.LotteryCompaigns.find(
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
    name: 'lotteryCompaignDetail',
    handler: async (_root, { _id }, { models, checkPermission, user }) => {
      return models.LotteryCompaigns.getLotteryCompaign(models, _id)
    }
  },
  {
    name: 'lotteryCompaignsCount',
    handler: async (_root, params, { models, checkPermission, user }) => {
      const filter = await generateFilter(models, params);

      return models.LotteryCompaigns.find(
        filter
      ).countDocuments();
    }
  }
]