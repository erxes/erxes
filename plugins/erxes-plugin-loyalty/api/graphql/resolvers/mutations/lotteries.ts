export default [
  {
    name: 'lotteriesAdd',
    handler: async (_root, doc, { models, user }) => {
      return models.Lotteries.createLottery(models, { ...doc, userId: user._id });
    }
  },
  {
    name: 'lotteriesEdit',
    handler: async (_root, doc, { models, user }) => {
      return models.Lotteries.updateLottery(models, doc._id, { ...doc, userId: user._id });
    }
  },
  {
    name: 'lotteriesRemove',
    handler: async (_root, doc, { models }) => {
      return models.Lotteries.removeLotteries(models, doc._ids);
    }
  },
];