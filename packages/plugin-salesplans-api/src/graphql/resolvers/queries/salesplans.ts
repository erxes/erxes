const salesLogQueries = {
  getBranches: async (_root, { user, models }, doc) => {
    if (doc._id) return await models.Branches.find({ _id: doc._id });
    return await models.Branches.find();
  },

  getUnits: async (_root, doc, { models }) => {
    if (doc._id) return await models.Units.find({ _id: doc._id });
    return await models.Units.find();
  },

  getProducts: async (_root, doc, { models }) => {
    if (doc._id) return await models.Products.find({ _id: doc._id });
    return await models.Products.find();
  },

  getLabels: async (_root, { type }: { type: string }, { models }) => {
    return await models.Labels.find({ type });
  },

  getSalesLogs: async (_root, doc, { models }) => {
    if (doc._id) return await models.SalesLogs.find({ _id: doc._id });
    return await models.SalesLogs.find();
  },

  getTimeframes: async (_root, doc, { models }) => {
    return await models.Timeframes.find({ salesLogId: doc.saleLogId });
  },

  getDayPlanConfig: async (_root, doc, { models }) => {
    return await models.DayPlanConfig.removeTimeframe(doc);
  },

  getMonthPlanConfig: async (_root, doc, { models }) => {
    return await models.MonthPlanConfigs.find({
      saleLogId: doc.saleLogId
    });
  }
};

export default salesLogQueries;
