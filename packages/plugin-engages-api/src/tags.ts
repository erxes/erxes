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

    return {
      status: 'success',
      data: result
    };
  }
};
