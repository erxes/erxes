import { debugError } from '@erxes/api-utils/src/debuggers';
import { generateModels } from './connectionResolver';
import { sendCommonMessage } from './messageBroker';

export default {
  types: [
    {
      description: 'Tickets',
      type: 'ticket',
    },
  ],

  tag: async ({ subdomain, data }) => {
    try {
      const { type, targetIds, tagIds, _ids, action } = data;

      const models = await generateModels(subdomain);

      let response = {};

      if (action === 'count') {
        response = await models.Tickets.countDocuments({
          tagIds: { $in: _ids },
        });
      }

      if (action === 'tagObject') {
        await models.Tickets.updateMany(
          { _id: { $in: targetIds } },
          { $set: { tagIds } }
        );

        response = await models.Tickets.find({
          _id: { $in: targetIds },
        }).lean();
        sendCommonMessage({
          serviceName: 'automations',
          subdomain,
          action: 'trigger',
          data: {
            type: 'tickets:ticket',
            targets: [response],
          },
        });
      }

      return response;
    } catch (error) {
      debugError(`Ticket:tag`, error);
    }
  },

  fixRelatedItems: async ({
    subdomain,
    data: { sourceId, destId, action },
  }) => {
    const models = await generateModels(subdomain);
    const model: any = models.Tickets;

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

      // add to the new destination
      await model.updateMany(
        { _id: { $in: itemIds } },
        { $set: { 'tagIds.$[elem]': destId } },
        { arrayFilters: [{ elem: { $eq: sourceId } }] }
      );
    }
  },
};
