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

export interface ITagModel extends Model<ITagDocument> {
  getTag(_id: string): Promise<ITagDocument>;
  createTag(doc: ITag): Promise<ITagDocument>;
  updateTag(_id: string, doc: ITag): Promise<ITagDocument>;
  removeTag(ids: string[]): void;
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

    /**
     * Create a tag
     */
    public static async createTag(doc: ITag) {
      const isUnique = await Tags.validateUniqueness(null, doc.name, doc.type);

      if (!isUnique) {
        throw new Error('Tag duplicated');
      }

      return Tags.create({
        ...doc,
        createdAt: new Date()
      });
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

      await Tags.updateOne({ _id }, { $set: doc });

      return Tags.findOne({ _id });
    }

    /**
     * Remove Tag
     */
    public static async removeTag(ids: string[]) {
      const tagCount = await Tags.find({ _id: { $in: ids } }).countDocuments();

      if (tagCount !== ids.length) {
        throw new Error('Tag not found');
      }

      let count = 0;

      count += await Customers.find({ tagIds: { $in: ids } }).countDocuments();
      count += await Conversations.find({
        tagIds: { $in: ids }
      }).countDocuments();
      count += await EngageMessages.find({
        tagIds: { $in: ids }
      }).countDocuments();
      count += await Companies.find({ tagIds: { $in: ids } }).countDocuments();
      count += await Integrations.findIntegrations({
        tagIds: { $in: ids }
      }).countDocuments();
      count += await Products.find({ tagIds: { $in: ids } }).countDocuments();

      if (count > 0) {
        throw new Error("Can't remove a tag with tagged object(s)");
      }

      return Tags.deleteMany({ _id: { $in: ids } });
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
  }

  tagSchema.loadClass(Tag);

  return tagSchema;
};

loadClass();

// tslint:disable-next-line
const Tags = model<ITagDocument, ITagModel>('tags', tagSchema);

export default Tags;
