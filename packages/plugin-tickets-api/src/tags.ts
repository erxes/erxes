import { Schema, Document, Model } from 'mongoose';
import _ from 'lodash';
import { generateModels, IModels } from './connectionResolver';
import { sendCommonMessage } from './messageBroker';

// Interfaces
export interface ITag {
  _id: string;
  name: string;
  color: string;
  type?: string;
  description?: string;
  order?: string;
  parentId?: string;
  relatedIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITagDocument extends ITag, Document {
  _id: string;
  order: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITagModel extends Model<ITagDocument> {
  getTag(_id: string): Promise<ITagDocument>;
  createTag(doc: ITag): Promise<ITagDocument>;
  updateTag(_id: string, doc: ITag): Promise<ITagDocument>;
  removeTag(_id: string): Promise<void>;
  validateUniqueness(selector: any, name: string | undefined, type: string | undefined): Promise<boolean>;
}

// Schema
export const tagSchema = new Schema<ITagDocument, ITagModel>(
  {
    name: { type: String, required: true },
    color: { type: String, required: true },
    type: String,
    description: String,
    order: { type: String, required: true },
    parentId: String,
    relatedIds: [String],
  },
  { timestamps: true }
);

// Class loader
export const loadTagClass = (models: IModels) => {
  class Tag {
    public static async getTag(_id: string) {
      const tag = await models.Tags.findOne({ _id });
      if (!tag) throw new Error('Tag not found');
      return tag;
    }

    public static async validateUniqueness(
      selector: any,
      name: string | undefined,
      type: string | undefined
    ) {
      if (!name || !type) return true;
      
      const count = await models.Tags.find(selector).countDocuments();
      if (selector && count > 1) return false;

      const obj = selector && (await models.Tags.findOne(selector));
      const filter: any = { name, type };
      if (obj) filter._id = { $ne: obj._id };

      const existing = await models.Tags.findOne(filter);
      return !existing;
    }

    static async getParentTag(doc: ITag) {
      if (!doc.parentId) return null;
      return models.Tags.findOne({ _id: doc.parentId });
    }

    public static async createTag(doc: ITag) {
      // Validate tag name
      if (doc.name && doc.name.includes('/')) {
        throw new Error("Tag name cannot contain forward slashes");
      }

      const isUnique = await models.Tags.validateUniqueness(null, doc.name, doc.type);
      if (!isUnique) throw new Error('Tag duplicated');

      const parentTag = await this.getParentTag(doc);
      const order = await this.generateOrder(parentTag, doc.name);

      const tag = await models.Tags.create({
        ...doc,
        order,
        createdAt: new Date()
      });

      await setRelatedIds(models, tag);
      return tag;
    }

    public static async updateTag(_id: string, doc: ITag) {
      // Validate tag name
      if (doc.name && doc.name.includes('/')) {
        throw new Error("Tag name cannot contain forward slashes");
      }

      const isUnique = await models.Tags.validateUniqueness({ _id }, doc.name, doc.type);
      if (!isUnique) throw new Error('Tag duplicated');

      // Comprehensive cycle detection
      const checkForCycle = async (childId: string, parentId: string): Promise<boolean> => {
        if (childId === parentId) return true;
        const parentTag = await models.Tags.findOne({ _id: parentId });
        if (!parentTag || !parentTag.parentId) return false;
        return checkForCycle(childId, parentTag.parentId);
      };
      
      if (doc.parentId && await checkForCycle(_id, doc.parentId)) {
        throw new Error("Cannot create circular reference in tag hierarchy");
      }

      const tag = await models.Tags.getTag(_id);
      const parentTag = await this.getParentTag(doc);
      const order = await this.generateOrder(parentTag, doc.name);

      // Find child tags with fixed regex
      const childTags = await models.Tags.find({
        $and: [
          { order: { $regex: new RegExp(`^${_.escapeRegExp(tag.order)}`, 'i') } },
          { _id: { $ne: _id } }
        ]
      });

      if (childTags.length > 0) {
        const bulkDoc = childTags.map(childTag => ({
          updateOne: {
            filter: { _id: childTag._id },
            update: { $set: { order: childTag.order.replace(tag.order, order) } }
          }
        }));

        await models.Tags.bulkWrite(bulkDoc);
        await removeRelatedIds(models, tag);
      }

      await models.Tags.updateOne({ _id }, { $set: { ...doc, order } });
      const updated = await models.Tags.findOne({ _id });

      if (updated) await setRelatedIds(models, updated);
      return updated;
    }

    public static async removeTag(_id: string) {
      const tag = await models.Tags.getTag(_id);
      const childCount = await models.Tags.find({ parentId: _id }).countDocuments();
      if (childCount > 0) throw new Error('Please remove child tags first');

      await removeRelatedIds(models, tag);
      return models.Tags.deleteOne({ _id });
    }

    public static async generateOrder(
      parentTag: ITagDocument | null, 
      name: string
    ) {
      return parentTag ? `${parentTag.order}${name}/` : `${name}/`;
    }
  }

  tagSchema.loadClass(Tag);
  return tagSchema;
};

// Related IDs helpers with cycle detection
const setRelatedIds = async (
  models: IModels, 
  tag: ITagDocument
) => {
  const visited = new Set<string>();
  
  const setRelatedIdsRecursive = async (currentTag: ITagDocument) => {
    // Cycle detection
    if (visited.has(currentTag._id.toString())) {
      throw new Error('Circular reference detected in tag hierarchy');
    }
    visited.add(currentTag._id.toString());

    if (currentTag.parentId) {
      const parentTag = await models.Tags.findOne({ _id: currentTag.parentId });
      if (parentTag) {
        // Compute new related IDs for parent
        let relatedIds: string[] = [
          currentTag._id.toString(),
          ...(currentTag.relatedIds || [])
        ];
        
        // Merge with parent's existing IDs
        relatedIds = _.union(relatedIds, parentTag.relatedIds || []);

        // Save to database
        await models.Tags.updateOne(
          { _id: parentTag._id },
          { $set: { relatedIds } }
        );

        // Recurse upward
        await setRelatedIdsRecursive(parentTag);
      }
    }
  };
  
  await setRelatedIdsRecursive(tag);
};

// Efficient related IDs removal
const removeRelatedIds = async (models: IModels, tag: ITagDocument) => {
  const relatedIdsToRemove = _.uniq([tag._id.toString(), ...(tag.relatedIds || [])]);
  
  // Find all tags containing these IDs
  const tags = await models.Tags.find({ relatedIds: { $in: relatedIdsToRemove } });
  
  if (tags.length > 0) {
    const bulkOperations = tags.map(t => {
      const updatedRelatedIds = (t.relatedIds || []).filter(id => !relatedIdsToRemove.includes(id));
      return {
        updateOne: {
          filter: { _id: t._id },
          update: { $set: { relatedIds: updatedRelatedIds } }
        }
      };
    });

    await models.Tags.bulkWrite(bulkOperations);
  }
};

// Service export
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
          targets: response
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
      if (tag) await removeRelatedIds(models, tag);
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