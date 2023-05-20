import { generateModels } from './connectionResolver';

export default {
  types: [
    {
      description: 'Documents',
      type: 'documents'
    }
  ],

  tag: async ({ subdomain, data }) => {
    const { targetIds, tagIds, _ids, action } = data;

    const models = await generateModels(subdomain);

    let response = {};

    if (action === 'count') {
      response = await models.Documents.countDocuments({
        tagIds: { $in: _ids }
      });
    }

    if (action === 'tagObject') {
      await models.Documents.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true }
      );

      response = await models.Documents.find({
        _id: { $in: targetIds }
      }).lean();
    }

    return response;
  }
};
