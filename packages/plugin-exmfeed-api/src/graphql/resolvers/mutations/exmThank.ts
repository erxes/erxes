import { checkPermission, requireLogin } from '@erxes/api-utils/src';
import { sendCoreMessage } from '../../../messageBroker';
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
  exmThankAdd: async (_root, doc: TExmThank, { user, docModifier, models }) => {
    const exmThank = models.ExmThanks.createThank(docModifier(doc), user);

    sendCoreMessage({
      subdomain: 'os',
      action: 'sendMobileNotification',
      data: {
        title: `${user.details.fullName} sent thank you to you`,
        body: doc.description,
        receivers: doc.recipientIds
      }
    });

    if (models.Exms) {
      await models.Exms.useScoring(user._id, 'exmThankAdd');

      for (const userId of doc.recipientIds || []) {
        await models.Exms.useScoring(userId, 'exmThankAdd');
      }
    }

    return exmThank;
  },

  exmThankEdit: async (
    _root,
    { _id, ...doc }: TExmThankEdit,
    { user, docModifier, models }
  ) => {
    const updated = await models.ExmThanks.updateThank(
      _id,
      docModifier(doc),
      user
    );

    return updated;
  },

  exmThankRemove: async (_root, { _id }: { _id: string }, { models }) => {
    const exmThank = models.ExmThanks.removeThank(_id);

    return exmThank;
  }
};

checkPermission(exmThankMutations, 'exmThankAdd', 'manageExmActivityFeed');
checkPermission(exmThankMutations, 'exmThankEdit', 'manageExmActivityFeed');
checkPermission(exmThankMutations, 'exmThankRemove', 'manageExmActivityFeed');

export default exmThankMutations;
