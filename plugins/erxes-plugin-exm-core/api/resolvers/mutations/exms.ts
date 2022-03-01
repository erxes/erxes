const exmMutations = [
  {
    name: "exmsAdd",
    handler: async (_root, doc: any, { models, user, checkPermission }) => {
      checkPermission("manageExms", user);

      const exm = await models.Exms.createExm(models, doc, user);

      return exm;
    },
  },
  {
    name: "exmsEdit",
    handler: async (
      _root,
      { _id, ...doc }: any,
      { models, user, checkPermission }
    ) => {
      checkPermission("manageExms", user);

      const updated = await models.Exms.updateExm(models, _id, doc);

      return updated;
    },
  },
  {
    name: "exmsRemove",
    handler: (
      _root,
      { _id }: { _id: string },
      { models, user, checkPermission }
    ) => {
      checkPermission("manageExms", user);

      return models.Exms.removeExm(models, _id);
    },
  },
  {
    name: "userRegistrationCreate",
    handler: async (_root, doc, { models }) => {
      const { email } = doc;

      const mail = email.toLowerCase().trim();

      const userCount = await models.Users.countDocuments({ email: mail });

      if (userCount > 0) {
        return "you already registered";
      }
      if (!doc.password) return "Password can not be empty";

      try {
        const result = await models.Users.createUser({
          isActive: false,
          email: mail,
          code: models,
          password: await doc.password,
        });
        return "success";
      } catch (e) {
        return "Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters";
      }
    },
  },
];

export default exmMutations;
