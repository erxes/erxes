import { generateModels } from './connectionResolver';

export default {
  types: [
    {
      description: 'Automations',
      type: 'automations'
    }
  ],
  tag: async ({ subdomain, data }) => {
    const { action, _ids, targetIds, tagIds } = data;

    const models = await generateModels(subdomain);

    let response = {};

    if (action === 'count') {
      response = await models.Automations.countDocuments({
        tagIds: { $in: _ids }
      });
    }

    if (action === 'tagObject') {
      await models.Automations.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true }
      );

      response = await models.Automations.find({
        _id: { $in: targetIds }
      }).lean();
    }

    return response;
  },
  fixRelatedItems: async ({
    subdomain,
    data: { sourceId, destId, action }
  }) => {
    const models = await generateModels(subdomain);

    if (action === 'remove') {
      await models.Automations.updateMany(
        { tagIds: { $in: [sourceId] } },
        { $pull: { tagIds: { $in: [sourceId] } } }
      );
    }

    if (action === 'merge') {
      const automationIds = await models.Automations.find(
        { tagIds: { $in: [sourceId] } },
        { _id: 1 }
      ).distinct('_id');

      await models.Automations.updateMany(
        {
          _id: { $in: automationIds }
        },
        {
          $set: { 'tagIds.$[elem]': destId }
        },
        {
          arrayFilters: [{ elem: { $eq: sourceId } }]
        }
      );
    }
  }
};
