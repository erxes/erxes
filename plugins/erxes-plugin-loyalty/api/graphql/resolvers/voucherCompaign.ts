export default [
  {
    type: 'VoucherCompaign',
    field: 'vouchersCount',
    handler: async (voucherCompaign, { }, { models }) => {
      const aggCount = await models.Vouchers.aggregate([
        { $match: { compaignId: voucherCompaign._id } },
        { $unionWith: { coll: 'spins', pipeline: [{ $match: { voucherCompaignId: voucherCompaign._id } }] } },
        { $unionWith: { coll: 'lotteries', pipeline: [{ $match: { voucherCompaignId: voucherCompaign._id } }] } },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $project: { _id: 0 } }
      ]);

      return aggCount.length && (aggCount[0] || {}).count || 0;
      // models.Vouchers.find({ compaignId: voucherCompaign._id }).countDocuments();
    }
  },
]