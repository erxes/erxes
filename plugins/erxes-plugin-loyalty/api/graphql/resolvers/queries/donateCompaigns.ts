import { paginate } from 'erxes-api-utils'

export default [
  {
    name: 'donateCompaigns',
    handler: async (_root, params, { models, checkPermission, user }) => {
      return paginate(
        models.DonateCompaigns.find({
          customerId: params.customerId
        }).sort({ modifiedAt: 1 }), {
        page: params.page,
        perPage: params.perPage
      }
      )
    }
  }
]