import { paginate } from 'erxes-api-utils'



export default [
  {
    name: 'vouchers',
    handler: async (_root, params, { models, checkPermission, user }) => {
      console.log(params, 'ddddddddddddd')
      return models.Vouchers.getVouchers(models, {...params, statuses: ['new']})
    }
  },
  {
    name: 'vouchersMain',
    handler: async (_root, params, { models, checkPermission, user }) => {
      const { page = 0, perPage = 0 } = params;
      console.log(params)

      const _page = Number(page || "1");
      const _limit = Number(perPage || "20");
      const _skip = (_page - 1) * _limit;

      const filter: any = {};
      const compaignFilter: any = {}
      const voucherFilter: any = {}

      if (params.compaignId) {
        compaignFilter.compaignId = params.compaignId
        voucherFilter.voucherCompaignId = params.compaignId
      }

      if (params.ownerType ) {
        compaignFilter.ownerType = params.ownerType
        voucherFilter.ownerType = params.ownerType
      }

      if (params.ownerId ) {
        compaignFilter.ownerId = params.ownerId
        voucherFilter.ownerId = params.ownerId
      }

      const aggregate = [
        { $match: { ...filter, ...compaignFilter } },
        { $unionWith: { coll: 'spins', pipeline: [{ $match: { ...filter, ...voucherFilter } }] } },
        { $unionWith: { coll: 'lotteries', pipeline: [{ $match: { ...filter, ...voucherFilter } }] } },
      ]
      const list = await models.Vouchers.aggregate([
        ...aggregate,
        { $skip: _skip },
        { $limit: _limit },
      ])

      const aggCount = await models.Vouchers.aggregate([
        ...aggregate,
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);

      const totalCount = aggCount.length && (aggCount[0] || {}).count || 0;

      return {
        list,
        totalCount
      }
    }
  }
]