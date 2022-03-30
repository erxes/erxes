import { checkPermission, requireLogin } from '@erxes/api-utils/src';
import { TExmThank } from '../../../models/definitions/exm';

export const gatherDescriptions = async () => {
  let extraDesc = [];
  let description = 'description';

  return { extraDesc, description };
};

type TExmThankEdit = {
  _id: string;
} & TExmThank;

const exmThankMutations = {
  exmThankAdd: async (
    _root,
    doc: TExmThank,
    { checkPermission, user, docModifier, models }
  ) => {
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
  },

  exmThankEdit: async (
    _root,
    { _id, ...doc }: TExmThankEdit,
    { checkPermission, user, docModifier, models }
  ) => {
    const updated = await models.ExmThanks.updateThank(
      models,
      _id,
      docModifier(doc),
      user
    );

    return updated;
  },

  exmThankRemove: async (
    _root,
    { _id }: { _id: string },
    { models, checkPermission, user }
  ) => {
    const exmThank = models.ExmThanks.removeThank(models, _id);

    return exmThank;
  },
};
requireLogin(exmThankMutations, 'manageExmActivityFeed');

checkPermission(exmThankMutations, 'exmThankAdd', 'manageExmActivityFeed');
checkPermission(exmThankMutations, 'exmThankEdit', 'manageExmActivityFeed');
checkPermission(exmThankMutations, 'exmThankRemove', 'manageExmActivityFeed');

export default exmThankMutations;
