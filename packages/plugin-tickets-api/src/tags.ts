<<<<<<< HEAD
import mongoose, { Document, Schema } from "mongoose";
import { field, schemaHooksWrapper } from "./models/definitions/utils";
import { generateModels } from './connectionResolver';
import { sendCommonMessage } from './messageBroker';
import _ from 'lodash';

export interface ITag {
  name: string;
  type: string;
  colorCode?: string;
  objectCount?: number;
  parentId?: string;
}

export interface ITagDocument extends ITag, Document {
  _id: string;
  createdAt: Date;
  order?: string;
  relatedIds?: string[];
}

export interface ITagModel extends mongoose.Model<ITagDocument> {

}

export const loadTagClass = () => {
  class Tag {

  }
  
  tagSchema.loadClass(Tag);
  return tagSchema;
};

export const tagSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: "Name" }),
    type: field({
      type: String,
      label: "Type",
      index: true
    }),
    colorCode: field({ type: String, label: "Color code" }),
    createdAt: field({ type: Date, label: "Created at" }),
    objectCount: field({ type: Number, label: "Object count" }),
    order: field({ type: String, label: "Order", index: true }),
    parentId: field({
      type: String,
      optional: true,
      index: true,
      label: "Parent"
    }),
    relatedIds: field({
      type: [String],
      optional: true,
      label: "Children tag ids"
    })
  }),
  "erxes_tags"
);

// For tags query performance
tagSchema.index({ type: 1, order: 1, name: 1 });

// Define model parameter type for helper functions
type ModelsParam = {
  Tags: ITagModel;
};

const setRelatedIds = async (
  models: ModelsParam,
  tag: ITagDocument,
  visitedIds: Set<string> = new Set()
) => {
  // Prevent cycles
  if (visitedIds.has(tag._id.toString())) {
    return;
  }
  visitedIds.add(tag._id.toString());

  if (tag.parentId) {
    const parentTag = await models.Tags.findOne({ _id: tag.parentId });

    if (parentTag) {
      let relatedIds: string[] = tag.relatedIds || [];
      relatedIds.push(tag._id);
      relatedIds = _.union(relatedIds, parentTag.relatedIds || []);

      await models.Tags.updateOne(
        { _id: parentTag._id },
        { $set: { relatedIds } }
      );

      const updated = await models.Tags.findOne({ _id: tag.parentId });
      if (updated) {
        await setRelatedIds(models, updated, visitedIds);
      }
    }
  }
};


const removeRelatedIds = async (models: ModelsParam, tag: ITagDocument) => {
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
=======
import { debugError } from '@erxes/api-utils/src/debuggers';
import { generateModels } from './connectionResolver';
import { sendCommonMessage } from './messageBroker';
>>>>>>> ba48ae9ef3022f066baf7df462675dc0961d2dc1

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

<<<<<<< HEAD
    const models = await generateModels(subdomain);
    const model: any = models.Tickets;

    let response = {};
=======
      const models = await generateModels(subdomain);

      let response = {};
>>>>>>> ba48ae9ef3022f066baf7df462675dc0961d2dc1

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
<<<<<<< HEAD

    if (action === "tagObject") {
      await model.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true }
      );
      
  
      // Update tag hierarchies
      const tags = await models.Tags.find({ _id: { $in: tagIds } });
      const visitedIds = new Set<string>();
      for (const tag of tags) {
        await setRelatedIds(models, tag, visitedIds);
      }

      response = await model.find({ _id: { $in: targetIds } }).lean();

      // Trigger automations
      sendCommonMessage({
        serviceName: "automations",
        subdomain,
        action: "trigger",
        data: {
          type: "tickets:ticket",
          targets: [response]
        },
        isRPC: true,
        defaultValue: null
      });
    }

    return response;
  },

  fixRelatedItems: async ({ subdomain, data: { sourceId, destId, action } }) => {
=======
  },

  fixRelatedItems: async ({
    subdomain,
    data: { sourceId, destId, action },
  }) => {
>>>>>>> ba48ae9ef3022f066baf7df462675dc0961d2dc1
    const models = await generateModels(subdomain);

<<<<<<< HEAD
    if (action === "remove") {
      // Remove tag from tickets
      await model.updateMany(
=======
    if (action === 'remove') {
      await models.Tickets.updateMany(
>>>>>>> ba48ae9ef3022f066baf7df462675dc0961d2dc1
        { tagIds: { $in: [sourceId] } },
        { $pull: { tagIds: { $in: [sourceId] } } }
      );

      // Clean up hierarchy
      const tag = await models.Tags.findOne({ _id: sourceId });
      if (tag) {
        await removeRelatedIds(models, tag);
      }
    }

<<<<<<< HEAD
    if (action === "merge") {
      // Find tickets with source tag
      const itemIds = await model
        .find({ tagIds: { $in: [sourceId] } }, { _id: 1 })
        .distinct("_id");

      // Replace source tag with destination tag
      await model.updateMany(
=======
    if (action === 'merge') {
      const itemIds = await models.Tickets.find(
        { tagIds: { $in: [sourceId] } },
        { _id: 1 }
      ).distinct('_id');

      // add to the new destination
      await models.Tickets.updateMany(
>>>>>>> ba48ae9ef3022f066baf7df462675dc0961d2dc1
        { _id: { $in: itemIds } },
        { $set: { 'tagIds.$[elem]': destId } },
        { arrayFilters: [{ elem: { $eq: sourceId } }] }
      );

      // Update tag hierarchies
      const sourceTag = await models.Tags.findOne({ _id: sourceId });
      const destTag = await models.Tags.findOne({ _id: destId });

      if (sourceTag && destTag) {
        await removeRelatedIds(models, sourceTag);
        await setRelatedIds(models, destTag);
      }
    }
  },
};
