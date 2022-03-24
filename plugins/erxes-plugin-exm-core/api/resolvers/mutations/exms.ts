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

      const configs = doc.scoringConfig || [];

      if (
        configs.length > 0 &&
        configs.length !== [...new Set(configs.map(c => c.action))].length
      ) {
        throw new Error('There are same configs');
      }

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
  },
  {
    name: 'userRegistrationCreate',
    handler: async (_root, doc, { models }) => {
      const { email } = doc;

      const mail = email.toLowerCase().trim();

      const userCount = await models.Users.countDocuments({ email: mail });

      if (userCount > 0) {
        throw new Error('You have already registered');
      }

      try {
        return await models.Users.createUser({
          isActive: false,
          email: mail,
          password: doc.password
        });
      } catch (e) {
        throw e;
      }
    }
  }
];

export default exmMutations;
