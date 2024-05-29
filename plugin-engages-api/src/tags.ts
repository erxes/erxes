import { generateModels } from './connectionResolver';

export default {
  types: [
    {
      description: 'Campaign',
      type: 'engageMessage'
    }
  ],

  tag: async ({ data, subdomain }) => {
    const models = await generateModels(subdomain);
    const { action = '', targetIds = [], _ids = [], tagIds = [] } = data;

    let result: any = {};

    if (action === 'count') {
      result = await models.EngageMessages.countDocuments({
        tagIds: { $in: _ids }
      });
    }

    if (action === 'tagObject') {
      await models.EngageMessages.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } }
      );

      result = await models.EngageMessages.find({
        _id: { $in: targetIds }
      }).lean();
    }

    return result;
  },
  fixRelatedItems: async ({
    subdomain,
    data: { sourceId, destId, action }
  }) => {
    const models = await generateModels(subdomain);

    if (action === 'remove') {
      await models.EngageMessages.updateMany(
        { tagIds: { $in: [sourceId] } },
        { $pull: { tagIds: { $in: [sourceId] } } }
      );
    }

    if (action === 'merge') {
      const itemIds = await models.EngageMessages.find(
        { tagIds: { $in: [sourceId] } },
        { _id: 1 }
      ).distinct('_id');

      // add to new destination
      await models.EngageMessages.updateMany(
        { _id: { $in: itemIds } },
        { $set: { 'tagIds.$[elem]': destId } },
        { arrayFilters: [{ elem: { $eq: sourceId } }] }
      );
    }
  }
};
