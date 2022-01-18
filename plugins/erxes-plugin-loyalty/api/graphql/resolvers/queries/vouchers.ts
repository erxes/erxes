import { paginate } from 'erxes-api-utils'

export default [
  {
    name: 'vouchers',
    handler: async (_root, params, { models, checkPermission, user }) => {
      let collection;
      const filter = {}
      if (filter.)
      return paginate(
        models.Vouchers.find({
          customerId: params.customerId
        }).sort({ modifiedAt: 1 }), {
        page: params.page,
        perPage: params.perPage
      }
      )
    }
  }
]