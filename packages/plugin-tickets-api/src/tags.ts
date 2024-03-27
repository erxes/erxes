import { generateModels } from './connectionResolver';

export default {
  types: [
    {
      description: 'Tickets',
      type: 'ticket',
    },
  ],

  tag: async ({ subdomain, data }) => {
    const { targetIds, tagIds, _ids, action } = data;

    const models = await generateModels(subdomain);

    let response = {};

    if (action === 'count') {
      response = await models.Tickets.countDocuments({ tagIds: { $in: _ids } });
    }

    if (action === 'tagObject') {
      await models.Tickets.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true }
      );

      response = await models.Tickets.find({ _id: { $in: targetIds } }).lean();
    }

    return response;
  },

  fixRelatedItems: async ({
    subdomain,
    data: { sourceId, destId, action },
  }) => {
    const models = await generateModels(subdomain);

    if (action === 'remove') {
      await models.Tickets.updateMany(
        { tagIds: { $in: [sourceId] } },
        { $pull: { tagIds: { $in: [sourceId] } } }
      );
    }

    if (action === 'merge') {
      const itemIds = await models.Tickets.find(
        { tagIds: { $in: [sourceId] } },
        { _id: 1 }
      ).distinct('_id');

      // add to the new destination
      await models.Tickets.updateMany(
        { _id: { $in: itemIds } },
        { $set: { 'tagIds.$[elem]': destId } },
        { arrayFilters: [{ elem: { $eq: sourceId } }] }
      );
    }
  },
};
