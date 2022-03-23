import { generateModels } from './connectionResolver';

export default {
  types: [
    {
      description: 'Product & Service',
      type: 'product'
    }
  ],

  tag: async ({ subdomain, data }) => {
    const { action, _ids, targetIds, tagIds } = data;
    const models = await generateModels(subdomain);

    let response = {};

    if (action === 'count') {
      response = await models.Products.countDocuments({
        tagIds: { $in: _ids }
      });
    }

    if (action === 'tagObject') {
      await models.Products.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true }
      );

      response = await models.Products.find({ _id: { $in: targetIds } }).lean();
    }

    return response;
  }
};
