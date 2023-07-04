import { generateModels } from './connectionResolver';

export default {
  generateInternalNoteNotif: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { contentTypeId, notifDoc } = data;

    const account = await models.Accounts.getAccount({ _id: contentTypeId });

    notifDoc.content = account.name;

    return notifDoc;
  }
};
