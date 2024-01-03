import { generateModels, IModels } from './connectionResolver';

const modelChanger = (type: string, models: IModels) => {
  if (type === 'task') {
    return models.Tasks;
  }
  if (type === 'purchase') {
    return models.Purchases;
  }
  if (type === 'ticket') {
    return models.Tickets;
  }

  return models.Deals;
};

export default {
  types: [
    {
      description: 'Deals',
      type: 'deal'
    },
    {
      description: 'Purchases',
      type: 'purchase'
    },
    {
      description: 'Tasks',
      type: 'task'
    },
    {
      description: 'Tickets',
      type: 'ticket'
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
  }
};
