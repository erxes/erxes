import { generateModels } from './connectionResolver';

export default {
  types: [
    {
      description: 'Deals',
      type: 'deal'
    }
  ],

  tag: async ({ subdomain, data }) => {
    const { type, targetIds, tagIds, _ids, action } = data;

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
  }
};
