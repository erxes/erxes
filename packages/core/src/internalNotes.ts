import { Users } from "./db/models";

export default {
  generateInternalNoteNotif: async ({ data }) => {
    const { contentTypeId, notifDoc } = data;

    const usr = await Users.getUser(contentTypeId);

    notifDoc.content = `${usr.username || usr.email}`;

    return notifDoc
  }
};