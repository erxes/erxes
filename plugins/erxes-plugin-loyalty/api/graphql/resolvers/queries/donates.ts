import { paginate } from 'erxes-api-utils'

export default [
  {
    name: 'donates',
    handler: async (_root, params, { models, checkPermission, user }) => {
      return models.Donates.getDonates(models, { ...params, statuses: ['new'] })
    }
  },
  {
    name: 'donatesMain',
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

      const list = paginate(models.Donates.find(filter), params);

      const totalCount = await models.Donates.find(filter).countDocuments();

      return {
        list,
        totalCount
      }
    }
  }
]