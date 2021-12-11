import { paginate } from 'erxes-api-utils'

export default [
  {
    name: 'lotteryCompaigns',
    handler: async (_root, params, { models, checkPermission, user }) => {
      return paginate(
        models.LotteryCompaigns.find({
          customerId: params.customerId
        }).sort({ modifiedAt: 1 }), {
        page: params.page,
        perPage: params.perPage
      }
      )
    }
  }
]