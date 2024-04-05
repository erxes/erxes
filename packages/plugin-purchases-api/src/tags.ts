import { generateModels, IModels } from './connectionResolver';

export default {
  types: [
    {
      description: 'Purchases',
      type: 'purchase',
    },
  ],

  tag: async ({ subdomain, data }) => {
    const { targetIds, tagIds, _ids, action } = data;

    const models = await generateModels(subdomain);

    let response = {};

    if (action === 'count') {
      response = await models.Purchases.countDocuments({
        tagIds: { $in: _ids },
      });
    }

    if (action === 'tagObject') {
      await models.Purchases.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true }
      );

      response = await models.Purchases.find({
        _id: { $in: targetIds },
      }).lean();
    }

    return response;
  },

  fixRelatedItems: async ({
    subdomain,
    data: { type, sourceId, destId, action },
  }) => {
    const models = await generateModels(subdomain);

    if (action === 'remove') {
      await models.Purchases.updateMany(
        { tagIds: { $in: [sourceId] } },
        { $pull: { tagIds: { $in: [sourceId] } } }
      );
    }

    if (action === 'merge') {
      const itemIds = await models.Purchases.find(
        { tagIds: { $in: [sourceId] } },
        { _id: 1 }
      ).distinct('_id');

      // add to the new destination
      await models.Purchases.updateMany(
        { _id: { $in: itemIds } },
        { $set: { 'tagIds.$[elem]': destId } },
        { arrayFilters: [{ elem: { $eq: sourceId } }] }
      );
    }
  },
};
