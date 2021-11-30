const exmMutations = [
  {
    name: 'exmsAdd',
    handler: async (_root, doc: any, { models, user, checkPermission }) => {
      checkPermission('manageExms', user);

      const exm = await models.Exms.createExm(models, doc, user);

      return exm;
    }
  },
  {
    name: 'exmsEdit',
    handler: async (
      _root,
      { _id, ...doc }: any,
      { models, user, checkPermission }
    ) => {
      checkPermission('manageExms', user);

      const updated = await models.Exms.updateExm(models, _id, doc);

      return updated;
    }
  },
  {
    name: 'exmsRemove',
    handler: (
      _root,
      { _id }: { _id: string },
      { models, user, checkPermission }
    ) => {
      checkPermission('manageExms', user);

      return models.Exms.removeExm(models, _id);
    }
  }
];

export default exmMutations;
