import { generateModels } from './connectionResolver';

export default {
  types: [
    {
      description: 'Reports',
      type: 'reports'
    }
  ],
  tag: async ({ subdomain, data }) => {
    const { action, _ids, targetIds, tagIds } = data;

    const models = await generateModels(subdomain);

    let response = {};

    if (action === 'count') {
      response = await models.Reports.countDocuments({
        tagIds: { $in: _ids }
      });
    }

    if (action === 'tagObject') {
      try {
        await models.Reports.updateMany(
          { _id: { $in: targetIds } },
          { $set: { tagIds } },
          { multi: true }
        );

        response = await models.Reports.find({
          _id: { $in: targetIds }
        }).lean();
      } catch (e) {
        console.error(e);
      }
    }

    return response;
  },
  fixRelatedItems: async ({
    subdomain,
    data: { sourceId, destId, action }
  }) => {
    const models = await generateModels(subdomain);

    if (action === 'remove') {
      await models.Reports.updateMany(
        { tagIds: { $in: [sourceId] } },
        { _id: 1 }
      );
    }

    if (action === 'merge') {
      const itemIds = await models.Reports.find(
        { tagIds: { $in: [sourceId] } },
        { _id: 1 }
      ).distinct('_id');

      // add to the new destination
      await models.Reports.updateMany(
        { _id: { $in: itemIds } },
        { $set: { 'tagIds.$[elem]': destId } },
        { arrayFilters: [{ elem: { $eq: sourceId } }] }
      );
    }
  }
};
