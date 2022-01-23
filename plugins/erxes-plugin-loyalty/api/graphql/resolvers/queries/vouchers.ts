export default [
  {
    name: 'vouchers',
    handler: async (_root, params, { models, checkPermission, user }) => {
      return models.Vouchers.getVouchers(models, { ...params, statuses: ['new'] })
    }
  },
  {
    name: 'vouchersMain',
    handler: async (_root, params, { models, checkPermission, user }) => {
      const { page = 0, perPage = 0 } = params;

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

      if (params.status) {
        filter.status = params.status
        filter.status = params.status
      }

      if (params.ownerType) {
        filter.ownerType = params.ownerType
        filter.ownerType = params.ownerType
      }

      if (params.ownerId) {
        filter.ownerId = params.ownerId
        filter.ownerId = params.ownerId
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