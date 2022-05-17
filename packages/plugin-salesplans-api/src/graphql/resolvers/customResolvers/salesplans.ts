export default {
  async createdUser(SalesLog, {}, { models }) {
    return models.Users.findOne({ _id: SalesLog.createdBy });
  },

  async branchDetail(SalesLog, {}, { models }) {
    return models.Branches.findOne({ _id: SalesLog.branchId });
  },

  async unitDetail(SalesLog, {}, { models }) {
    return models.Units.findOne({ _id: SalesLog.unitId });
  }
};
