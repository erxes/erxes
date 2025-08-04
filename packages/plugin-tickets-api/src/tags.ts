import { generateModels } from './connectionResolver';
import { sendCommonMessage } from './messageBroker';
import _ from 'lodash';

const setRelatedIds = async (models, tag) => {
  if (tag.parentId) {
    const parentTag = await models.Tags.findOne({ _id: tag.parentId });

    if (parentTag) {
      let relatedIds: string[] = tag.relatedIds || [];
      relatedIds.push(tag._id);
      relatedIds = _.union(relatedIds, parentTag.relatedIds || []);

      await models.Tags.updateOne({ _id: parentTag._id }, { $set: { relatedIds } });

      const updated = await models.Tags.findOne({ _id: tag.parentId });
      if (updated) {
        await setRelatedIds(models, updated);
      }
    }
  }
};

const removeRelatedIds = async (models, tag) => {
  const tags = await models.Tags.find({ relatedIds: { $in: [tag._id] } });
  if (tags.length === 0) return;

  const relatedIds: string[] = tag.relatedIds || [];
  relatedIds.push(tag._id);

  const doc = tags.map(t => {
    const ids = (t.relatedIds || []).filter(id => !relatedIds.includes(id));
    return {
      updateOne: {
        filter: { _id: t._id },
        update: { $set: { relatedIds: ids } }
      }
    };
  });

  await models.Tags.bulkWrite(doc);
};

export default {
  types: [
    {
      description: 'Tickets',
      type: 'ticket'
    }
  ],

  tag: async ({ subdomain, data }) => {
    const { type, targetIds, tagIds, _ids, action } = data;

    const models = await generateModels(subdomain);
    const model: any = models.Tickets;

    let response = {};

    if (action === 'count') {
      response = await model.countDocuments({ tagIds: { $in: _ids } });
    }

    if (action === 'tagObject') {
      await model.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true }
      );

      // Set related tagIds for each tag
      const tags = await models.Tags.find({ _id: { $in: tagIds } });

      for (const tag of tags) {
        await setRelatedIds(models, tag);
      }

      response = await model.find({ _id: { $in: targetIds } }).lean();

      sendCommonMessage({
        serviceName: 'automations',
        subdomain,
        action: 'trigger',
        data: {
          type: 'tickets:ticket',
          targets: [response]
        },
        isRPC: true,
        defaultValue: null
      });
    }

    return response;
  },

  fixRelatedItems: async ({ subdomain, data: { sourceId, destId, action } }) => {
    const models = await generateModels(subdomain);
    const model: any = models.Tickets;

    if (action === 'remove') {
      await model.updateMany(
        { tagIds: { $in: [sourceId] } },
        { $pull: { tagIds: { $in: [sourceId] } } }
      );

      const tag = await models.Tags.findOne({ _id: sourceId });
      if (tag) {
        await removeRelatedIds(models, tag);
      }
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

      const sourceTag = await models.Tags.findOne({ _id: sourceId });
      const destTag = await models.Tags.findOne({ _id: destId });

      if (sourceTag && destTag) {
        await removeRelatedIds(models, sourceTag);
        await setRelatedIds(models, destTag);
      }
    }
  }
};
