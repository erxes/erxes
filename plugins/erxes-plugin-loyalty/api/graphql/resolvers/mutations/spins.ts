export default [
  {
    name: 'spinsAdd',
    handler: async (_root, doc, { models, user }) => {
      return models.Spins.createSpin(models, { ...doc, userId: user._id });
    }
  },
  {
    name: 'spinsEdit',
    handler: async (_root, doc, { models, user }) => {
      return models.Spins.updateSpin(models, doc._id, { ...doc, userId: user._id });
    }
  },
  {
    name: 'spinsRemove',
    handler: async (_root, doc, { models }) => {
      return models.Spins.removeSpins(models, doc._ids);
    }
  },
];