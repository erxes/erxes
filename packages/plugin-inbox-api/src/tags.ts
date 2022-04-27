import { generateModels, IModels } from './connectionResolver';
import { publishConversationsChanged } from './graphql/resolvers/conversationMutations';

const modelChanger = (type: string, models: IModels) => {
  if (type === 'integration') {
    return models.Integrations;
  }

  return models.Conversations;
};

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
    const model: any = modelChanger(type, models);

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
  },
  publishChange: ({ data: { targetIds, type } }) =>
    publishConversationsChanged(targetIds, type),

  fixRelatedItems: async ({
    subdomain,
    data: { sourceId, destId, type, action }
  }) => {
    const models = await generateModels(subdomain);
    const model: any = modelChanger(type, models);

    if (action === 'remove') {
      await model.updateMany(
        { tagIds: { $in: [sourceId] } },
        { $pull: { tagIds: { $in: [sourceId] } } }
      );
    }

    if (action === 'merge') {
      const itemIds = await model
        .find({ tagIds: { $in: [sourceId] } }, { _id: 1 })
        .distinct('_id');

      // add to new destination
      await model.updateMany(
        { _id: { $in: itemIds } },
        { $set: { 'tagIds.$[elem]': destId } },
        { arrayFilters: [{ elem: { $eq: sourceId } }] }
      );
    }
  }
};
