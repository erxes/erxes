import { generateModels, IModels } from './connectionResolver';

export default {
  types: [
    {
      description: 'Email Template',
      type: 'emailtemplates'
    }
  ],

  tag: async ({ subdomain, data }) => {
    const { targetIds, tagIds, _ids, action } = data;

    const models = await generateModels(subdomain);

    let response = {};

    if (action === 'count') {
      response = await models.EmailTemplates.countDocuments({
        tagIds: { $in: _ids }
      });
    }

    if (action === 'tagObject') {
      await models.EmailTemplates.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true }
      );

      response = await models.EmailTemplates.find({
        _id: { $in: targetIds }
      }).lean();
    }

    return response;
  }
};
