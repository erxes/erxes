import { generateModels } from './connectionResolver';

export default {
  generateInternalNoteNotif: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { contentTypeId, notifDoc } = data;

    const product = await models.Buildings.getBuilding({ _id: contentTypeId });

    notifDoc.content = product.name;

    return notifDoc;
  }
};
