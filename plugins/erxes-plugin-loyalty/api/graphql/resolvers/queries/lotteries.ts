import { paginate } from 'erxes-api-utils'

export default [
  {
    name: 'lotteries',
    handler: async (_root, params, { models, checkPermission, user }) => {
      return models.Lotteries.getLotteries(models, { ...params, statuses: ['new'] })
    }
  },
  {
    name: 'lotteriesMain',
    handler: async (_root, params, { models, checkPermission, user }) => {
      const filter: any = {};

      if (params.compaignId) {
        filter.compaignId = params.compaignId
      }

      if (params.status) {
        filter.status = params.status
      }

      if (params.ownerType) {
        filter.ownerType = params.ownerType
      }

      if (params.ownerId) {
        filter.ownerId = params.ownerId
      }

      const list = paginate(models.Lotteries.find(filter), params);

      const totalCount = await models.Lotteries.find(filter).countDocuments();

      return {
        list,
        totalCount
      }
    }
  }
]