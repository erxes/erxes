import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  sendNotification
} from 'erxes-api-utils';

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
      {
        checkPermission,
        user,
        docModifier,
        models,
        messageBroker,
        memoryStorage,
        graphqlPubsub
      }
    ) => {
      await checkPermission('manageExm', user);

      const exmThank = models.ExmThanks.createThank(
        models,
        docModifier(doc),
        user
      );

      await putCreateLog(
        messageBroker,
        gatherDescriptions,
        {
          type: 'exmThank',
          newData: doc,
          object: exmThank,
          extraParams: { models }
        },
        user
      );

      const notifDoc = {
        createdUser: user,
        link: `/erxes-plugin-exm-feed`,
        title: 'Recieved a thank you',
        content: doc.description,
        notifType: 'plugin',
        receivers: doc.recipientIds,
        action: 'updated conversation'
      };

      console.log('notifDoc: ', notifDoc);

      sendNotification(models, memoryStorage, graphqlPubsub, notifDoc);

      return exmThank;
    }
  },

  {
    name: 'exmThankEdit',
    handler: async (
      _root,
      { _id, ...doc },
      { messageBroker, checkPermission, user, docModifier, models }
    ) => {
      await checkPermission('manageExm', user);

      const exmThank = await models.ExmThanks.findOne({
        _id
      });

      const updated = await models.ExmThanks.updateThank(
        models,
        _id,
        docModifier(doc),
        user
      );

      await putUpdateLog(
        messageBroker,
        gatherDescriptions,
        {
          type: 'exmThank',
          object: exmThank,
          newData: { ...doc },
          updatedDocument: updated,
          extraParams: { models }
        },
        user
      );

      return updated;
    }
  },

  {
    name: 'exmThankRemove',
    handler: async (
      _root,
      { _id },
      { messageBroker, models, checkPermission, user }
    ) => {
      await checkPermission('manageExm', user);

      const exmThank = models.ExmThanks.removeThank(models, _id);

      await putDeleteLog(
        messageBroker,
        gatherDescriptions,
        {
          type: 'exmThank',
          object: exmThank,
          extraParams: { models }
        },
        user
      );

      return exmThank;
    }
  }
];

export default exmThankMutations;
