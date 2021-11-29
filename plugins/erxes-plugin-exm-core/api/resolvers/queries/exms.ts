const exmQueries = [
  {
    name: 'exms',
    handler: async (_root, args: any, { models, user, checkPermission }) => {
      checkPermission('showExms', user);

      return {
        list: await models.Exms.find(args).sort({ createdAt: -1 }),
        totalCount: await models.Exms.countDocuments()
      };
    }
  },
  {
    name: 'exmGet',
    handler: (_root, _args, { models, user, checkPermission }) => {
      checkPermission('showExms', user);

      return models.Exms.findOne().sort({ createdAt: -1 });
    }
  }
];

export default exmQueries;
