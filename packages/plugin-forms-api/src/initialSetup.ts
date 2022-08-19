import { generateModels } from './connectionResolver';

export default {
  generate: async ({ subdomain }) => {
    const models = await generateModels(subdomain);

    await models.FieldsGroups.createSystemGroupsFields();
  }
};
