import { generateModels, IModels } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';

export default {
  types: [
    {
      description: 'Tickets',
      type: 'ticket',
    },
  ],

  tag: async ({ subdomain, data }) => {
    const { targetIds, tagIds, _ids, action } = data;
    const models: IModels = await generateModels(subdomain);
    const model: any = models.Tickets;
    let response = {};

    if (action === 'count') {
      response = await model.countDocuments({ tagIds: { $in: _ids } });
    }

    if (action === 'tagObject') {
      // Update ticket tagIds
      await model.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true }
      );

      // Also update the core tags service
      await sendCoreMessage({
        subdomain,
        action: 'tags.tagObject',
        data: {
          type: 'tickets:ticket',
          targetIds,
          tagIds,
        },
        isRPC: true,
      });

      // Notify Core Tags plugin
      await sendCoreMessage({
        subdomain,
        action: 'setRelatedIds',
        data: { tagIds },
        isRPC: false,
      });

      // Fetch updated tickets
      response = await model.find({ _id: { $in: targetIds } }).lean();

      // Trigger tickets update in Core
      await sendCoreMessage({
        subdomain,
        action: 'trigger',
        data: {
          type: 'tickets:ticket',
          targets: response,
        },
        isRPC: true,
        defaultValue: null,
      });
    }

    return response;
  },

  fixRelatedItems: async ({ subdomain, data: { sourceId, destId, action } }) => {
    const models: IModels = await generateModels(subdomain);
    const model: any = models.Tickets;

    if (action === 'remove') {
      await model.updateMany(
        { tagIds: { $in: [sourceId] } },
        { $pull: { tagIds: sourceId } }
      );

      await sendCoreMessage({
        subdomain,
        action: 'removeRelatedIds',
        data: { tagId: sourceId },
        isRPC: false,
      });
    }

    if (action === 'merge') {
      const itemIds = await model
        .find({ tagIds: { $in: [sourceId] } }, { _id: 1 })
        .distinct('_id');

      await model.updateMany(
        { _id: { $in: itemIds } },
        { $set: { 'tagIds.$[elem]': destId } },
        { arrayFilters: [{ elem: { $eq: sourceId } }] }
      );

      await sendCoreMessage({
        subdomain,
        action: 'mergeRelatedIds',
        data: { sourceId, destId },
        isRPC: false,
      });
    }
  },
};

export const findTags = async (subdomain: string, data: any) => {
  return sendCoreMessage({
    subdomain,
    action: "tagFind",
    data,
    isRPC: true,
    defaultValue: [],
  });
};

export const findTagOne = async (subdomain: string, data: any) => {
  return sendCoreMessage({
    subdomain,
    action: "tagFindOne",
    data,
    isRPC: true,
    defaultValue: null,
  });
};


