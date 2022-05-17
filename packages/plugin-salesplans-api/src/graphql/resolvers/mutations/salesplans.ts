const salesLogMutations = {
  saveSalesLog: async (_root, { user, models }, doc) => {
    return await models.SalesLogs.createSalesLog(doc, user);
  },

  saveLabels: async (_root, doc, { models }) => {
    return await models.Labels.saveLabels(doc);
  },

  saveTimeframe: async (_root, doc, { models }) => {
    return await models.Timeframes.saveTimeframes(doc);
  },

  saveDayPlanConfig: async (_root, doc, { models }) => {
    return await models.DayPlanConfigs.saveDayPlanConfig(doc);
  },

  saveMonthPlanConfig: async (_root, doc, { models }) => {
    return await models.MonthPlanConfigs.saveMonthPlanConfig(doc);
  },

  removeLabel: async (_root, { _id }: { _id: string }, { models }) => {
    return await models.Labels.removeLabel(_id);
  },

  removeDayTimeframe: async (_root, doc, { models }) => {
    return await models.Timeframes.removeTimeframe(doc);
  },

  removeSalesLog: async (_root, doc, { models }) => {
    return await models.SalesLogs.removeSalesLog(doc);
  }
};

export default salesLogMutations;
