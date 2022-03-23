import { TExmThank } from '../../definitions';

export const gatherDescriptions = async () => {
  let extraDesc = [];
  let description = 'description';

  return { extraDesc, description };
};

type TExmThankEdit = {
  _id: string;
} & TExmThank;

const exmThankMutations = [
  {
    name: 'exmThankAdd',
    handler: async (
      _root,
      doc: TExmThank,
      { checkPermission, user, docModifier, models }
    ) => {
      await checkPermission('manageExmActivityFeed', user);

      const exmThank = models.ExmThanks.createThank(
        models,
        docModifier(doc),
        user
      );

      if (models.Exms) {
        await models.Exms.useScoring(models, user._id, 'exmThankAdd');

        for (const userId of doc.recipientIds || []) {
          await models.Exms.useScoring(models, userId, 'exmThankAdd');
        }
      }

      return exmThank;
    }
  },

  {
    name: 'exmThankEdit',
    handler: async (
      _root,
      { _id, ...doc }: TExmThankEdit,
      { checkPermission, user, docModifier, models }
    ) => {
      await checkPermission('manageExmActivityFeed', user);

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
    handler: async (
      _root,
      { _id }: { _id: string },
      { models, checkPermission, user }
    ) => {
      await checkPermission('manageExmActivityFeed', user);

      const exmThank = models.ExmThanks.removeThank(models, _id);

      return exmThank;
    }
  }
];

export default exmThankMutations;
