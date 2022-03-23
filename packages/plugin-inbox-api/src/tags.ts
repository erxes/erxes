import { generateModels } from './connectionResolver';

export default {
  types: [
    {
      description: 'Integration',
      type: 'integration'
    },
    {
      description: 'Conversation',
      type: 'conversation'
    }
  ],

  tag: async ({ subdomain, data }) => {
    const { type, targetIds, tagIds, _ids, action } = data;

    const models = await generateModels(subdomain);

    let response = {};
    let model: any = models.Conversations;

    if (type === 'integration') {
      model = models.Integrations;
    }

    if (action === 'count') {
      response = await model.countDocuments({ tagIds: { $in: _ids } });
    }

    if (action === 'tagObject') {
      await model.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true }
      );

      response = await model.find({ _id: { $in: targetIds } }).lean();
    }

    return response;
  }
};
