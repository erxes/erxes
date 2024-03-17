import { generateModels, IModels } from './connectionResolver';

export default {
  types: [
    {
      description: 'Deals',
      type: 'deal',
    },
  ],

  tag: async ({ subdomain, data }) => {
    const { targetIds, tagIds, _ids, action } = data;

    const models = await generateModels(subdomain);

    let response = {};

    if (action === 'count') {
      response = await models.Deals.countDocuments({ tagIds: { $in: _ids } });
    }

    if (action === 'tagObject') {
      await models.Deals.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true }
      );

      response = await models.Deals.find({ _id: { $in: targetIds } }).lean();
    }

    return response;
  },

  fixRelatedItems: async ({
    subdomain,
    data: { type, sourceId, destId, action },
  }) => {
    const models = await generateModels(subdomain);

    if (action === 'remove') {
      await models.Deals.updateMany(
        { tagIds: { $in: [sourceId] } },
        { $pull: { tagIds: { $in: [sourceId] } } }
      );
    }

    if (action === 'merge') {
      const itemIds = await models.Deals.find(
        { tagIds: { $in: [sourceId] } },
        { _id: 1 }
      ).distinct('_id');

      // add to the new destination
      await models.Deals.updateMany(
        { _id: { $in: itemIds } },
        { $set: { 'tagIds.$[elem]': destId } },
        { arrayFilters: [{ elem: { $eq: sourceId } }] }
      );
    }
  },
};
