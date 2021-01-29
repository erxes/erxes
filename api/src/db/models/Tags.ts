import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import {
  Companies,
  Conversations,
  Customers,
  EngageMessages,
  Integrations,
  Products
} from '.';
import { ITag, ITagDocument, tagSchema } from './definitions/tags';

interface ITagObjectParams {
  tagIds: string[];
  objectIds: string[];
  collection: any;
  tagType: string;
}

// set related tags
const setRelatedIds = async (tag: ITagDocument) => {
  if (tag.parentId) {
    const parentTag = await Tags.findOne({ _id: tag.parentId });

    if (parentTag) {
      let relatedIds: string[];

      relatedIds = tag.relatedIds || [];
      relatedIds.push(tag._id);

      relatedIds = _.union(relatedIds, parentTag.relatedIds || []);

      await Tags.updateOne({ _id: parentTag._id }, { $set: { relatedIds } });

      const updated = await Tags.findOne({ _id: tag.parentId });

      if (updated) {
        await setRelatedIds(updated);
      }
    }
  }
};

// remove related tags
const removeRelatedIds = async (tag: ITagDocument) => {
  const tags = await Tags.find({ relatedIds: { $in: tag._id } });

  if (tags.length === 0) {
    return;
  }

  const relatedIds: string[] = tag.relatedIds || [];
  relatedIds.push(tag._id);

  const doc: Array<{
    updateOne: {
      filter: { _id: string };
      update: { $set: { relatedIds: string[] } };
    };
  }> = [];

  tags.forEach(async t => {
    const ids = (t.relatedIds || []).filter(id => !relatedIds.includes(id));

    doc.push({
      updateOne: {
        filter: { _id: t._id },
        update: { $set: { relatedIds: ids } }
      }
    });
  });

  await Tags.bulkWrite(doc);
};

export interface ITagModel extends Model<ITagDocument> {
  getTag(_id: string): Promise<ITagDocument>;
  createTag(doc: ITag): Promise<ITagDocument>;
  updateTag(_id: string, doc: ITag): Promise<ITagDocument>;
  removeTag(_id: string): void;
  tagsTag(type: string, targetIds: string[], tagIds: string[]): void;
  tagObject(params: ITagObjectParams): void;
  validateUniqueness(
    selector: any,
    name: string,
    type: string
  ): Promise<boolean>;
}

export const loadClass = () => {
  class Tag {
    /*
     * Get a tag
     */
    public static async getTag(_id: string) {
      const tag = await Tags.findOne({ _id });

      if (!tag) {
        throw new Error('Tag not found');
      }

      return tag;
    }
    /*
     * Validates tag uniquness
     */
    public static async validateUniqueness(
      selector: any,
      name: string,
      type: string
    ): Promise<boolean> {
      // required name and type
      if (!name || !type) {
        return true;
      }

      // can't update name & type same time more than one tags.
      const count = await Tags.find(selector).countDocuments();

      if (selector && count > 1) {
        return false;
      }

      const obj = selector && (await Tags.findOne(selector));

      const filter: any = { name, type };

      if (obj) {
        filter._id = { $ne: obj._id };
      }

      const existing = await Tags.findOne(filter);

      if (existing) {
        return false;
      }

      return true;
    }

    /*
     * Common helper for taggable objects like conversation, engage, customer etc ...
     */
    public static async tagObject({
      tagIds,
      objectIds,
      collection,
      tagType
    }: ITagObjectParams) {
      const prevTagsCount = await Tags.find({
        _id: { $in: tagIds },
        type: tagType
      }).countDocuments();

      if (prevTagsCount !== tagIds.length) {
        throw new Error('Tag not found.');
      }

      const objects = await collection.find(
        { _id: { $in: objectIds } },
        { tagIds: 1 }
      );

      let removeIds: string[] = [];

      objects.forEach(obj => {
        removeIds.push(obj.tagIds);
      });

      removeIds = _.uniq(_.flatten(removeIds));

      await Tags.updateMany(
        { _id: { $in: removeIds } },
        { $inc: { objectCount: -1 } },
        { multi: true }
      );

      await collection.updateMany(
        { _id: { $in: objectIds } },
        { $set: { tagIds } },
        { multi: true }
      );

      await Tags.updateMany(
        { _id: { $in: tagIds } },
        { $inc: { objectCount: 1 } },
        { multi: true }
      );
    }

    /*
     * Get a parent tag
     */
    static async getParentTag(doc: ITag) {
      return Tags.findOne({
        _id: doc.parentId
      }).lean();
    }

    /**
     * Create a tag
     */
    public static async createTag(doc: ITag) {
      const isUnique = await Tags.validateUniqueness(null, doc.name, doc.type);

      if (!isUnique) {
        throw new Error('Tag duplicated');
      }

      const parentTag = await this.getParentTag(doc);

      // Generatingg order
      const order = await this.generateOrder(parentTag, doc);

      const tag = await Tags.create({
        ...doc,
        order,
        createdAt: new Date()
      });

      await setRelatedIds(tag);

      return tag;
    }

    /**
     * Update Tag
     */
    public static async updateTag(_id: string, doc: ITag) {
      const isUnique = await Tags.validateUniqueness(
        { _id },
        doc.name,
        doc.type
      );

      if (!isUnique) {
        throw new Error('Tag duplicated');
      }

      const parentTag = await this.getParentTag(doc);

      if (parentTag && parentTag.parentId === _id) {
        throw new Error('Cannot change tag');
      }

      // Generatingg  order
      const order = await this.generateOrder(parentTag, doc);

      const tag = await Tags.findOne({
        _id
      });

      if (tag && tag.order) {
        const childTags = await Tags.find({
          $and: [
            { order: { $regex: new RegExp(tag.order, 'i') } },
            { _id: { $ne: _id } }
          ]
        });

        const bulkDoc: Array<{
          updateOne: {
            filter: { _id: string };
            update: { $set: { order: string } };
          };
        }> = [];

        // updating child categories order
        childTags.forEach(async childTag => {
          let childOrder = childTag.order;

          if (tag.order && childOrder) {
            childOrder = childOrder.replace(tag.order, order);

            bulkDoc.push({
              updateOne: {
                filter: { _id: childTag._id },
                update: { $set: { order: childOrder } }
              }
            });
          }
        });

        await Tags.bulkWrite(bulkDoc);

        await removeRelatedIds(tag);
      }

      await Tags.updateOne({ _id }, { $set: { ...doc, order } });

      const updated = await Tags.findOne({ _id });

      if (updated) {
        await setRelatedIds(updated);
      }

      return updated;
    }

    /**
     * Remove Tag
     */
    public static async removeTag(_id: string) {
      const tag = await Tags.findOne({ _id });

      if (!tag) {
        throw new Error('Tag not found');
      }

      const childCount = await Tags.countDocuments({ parentId: _id });

      if (childCount > 0) {
        throw new Error("Can't remove a tag");
      }

      const selector = { tagIds: { $in: [_id] } };

      let count = 0;
      count += await Customers.countDocuments(selector);
      count += await Conversations.countDocuments(selector);
      count += await EngageMessages.countDocuments(selector);
      count += await Companies.countDocuments(selector);
      count += await Integrations.findIntegrations(selector).countDocuments();
      count += await Products.countDocuments(selector);

      if (count > 0) {
        throw new Error("Can't remove a tag with tagged object(s)");
      }

      await removeRelatedIds(tag);

      return Tags.deleteOne({ _id });
    }

    /**
     * Attach a tag
     */
    public static async tagsTag(
      type: string,
      targetIds: string[],
      tagIds: string[]
    ) {
      let collection: any = Conversations;

      switch (type) {
        case 'customer':
          collection = Customers;
          break;
        case 'engageMessage':
          collection = EngageMessages;
          break;
        case 'company':
          collection = Companies;
          break;
        case 'integration':
          collection = Integrations;
          break;
        case 'product':
          collection = Products;
          break;
      }

      await Tags.tagObject({
        tagIds,
        objectIds: targetIds,
        collection,
        tagType: type
      });
    }

    /**
     * Generating order
     */
    public static async generateOrder(
      parentTag: ITagDocument,
      { name, type }: { name: string; type: string }
    ) {
      const order = `${name}${type}`;

      if (!parentTag) {
        return order;
      }

      let parentOrder = parentTag.order;

      if (!parentOrder) {
        parentOrder = `${parentTag.name}${parentTag.type}`;

        await Tags.updateOne(
          {
            _id: parentTag._id
          },
          { $set: { order: parentOrder } }
        );
      }

      return `${parentOrder}/${order}`;
    }
  }

  tagSchema.loadClass(Tag);

  return tagSchema;
};

loadClass();

// tslint:disable-next-line
const Tags = model<ITagDocument, ITagModel>('tags', tagSchema);

export default Tags;
