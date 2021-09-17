export const gatherDescriptions = async () => {
  let extraDesc = [];
  let description = 'description';

  return { extraDesc, description };
};

const exmThankMutations = [
  {
    name: 'exmThankAdd',
    handler: async (
      _root,
      doc,
      { checkPermission, user, docModifier, models }
    ) => {
      await checkPermission('manageExm', user);

      const exmThank = models.ExmThanks.createThank(
        models,
        docModifier(doc),
        user
      );

      // const notifDoc = {
      //   createdUser: user,
      //   link: `/erxes-plugin-exm-feed`,
      //   title: 'Recieved a thank you',
      //   content: doc.description,
      //   notifType: 'plugin',
      //   receivers: doc.recipientIds,
      //   action: 'updated conversation'
      // };

      // sendNotification(models, memoryStorage, graphqlPubsub, notifDoc);

      return exmThank;
    }
  },

  {
    name: 'exmThankEdit',
    handler: async (
      _root,
      { _id, ...doc },
      { checkPermission, user, docModifier, models }
    ) => {
      await checkPermission('manageExm', user);

      const updated = await models.ExmThanks.updateThank(
        models,
        _id,
        docModifier(doc),
        user
      );

      return updated;
    }
  },

  {
    name: 'exmThankRemove',
    handler: async (_root, { _id }, { models, checkPermission, user }) => {
      await checkPermission('manageExm', user);

      const exmThank = models.ExmThanks.removeThank(models, _id);

      return exmThank;
    }
  }
];

export default exmThankMutations;
