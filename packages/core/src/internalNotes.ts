import { generateModels } from "./connectionResolver";

export default {
  generateInternalNoteNotif: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { contentTypeId, notifDoc } = data;

    const usr = await models.Users.getUser(contentTypeId);

    notifDoc.content = `${usr.username || usr.email}`;

    return notifDoc
  }
};