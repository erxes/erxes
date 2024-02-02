import { generateModels } from './connectionResolver';

export default {
  types: [
    {
      description: 'Insurance product',
      type: 'product',
    },
  ],
  tag: async ({ subdomain, data }) => {
    const { type, action, _ids, tagIds, targetIds } = data;

    const models = await generateModels(subdomain);

    let response = {};

    if (action === 'count') {
      response = await models.Products.countDocuments({
        tagIds: { $in: _ids },
      });
    }

    if (action === 'tagObject') {
      await models.Products.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true },
      );

      response = await models.Products.find({ _id: { $in: targetIds } }).lean();
    }

    return response;
  },
  fixRelatedItems: async ({
    subdomain,
    data: { sourceId, destId, type, action },
  }) => {
    const models = await generateModels(subdomain);

    if (action === 'remove') {
      await models.Products.updateMany(
        { tagIds: { $in: [sourceId] } },
        { $pull: { tagIds: { $in: [sourceId] } } },
      );
    }

    if (action === 'merge') {
      const itemIds = await models.Products.find(
        { tagIds: { $in: [sourceId] } },
        { _id: 1 },
      ).distinct('_id');

      // add to new destination
      await models.Products.updateMany(
        { _id: { $in: itemIds } },
        { $set: { 'tagIds.$[elem]': destId } },
        { arrayFilters: [{ elem: { $eq: sourceId } }] },
      );
    }
  },
};
