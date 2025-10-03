import { escapeRegExp } from 'erxes-api-shared/utils';
import { ITag, ITagDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { removeRelatedTagIds, setRelatedTagIds } from '@/tags/utils';
import { tagSchema } from '@/tags/db/definitions/tags';
export interface ITagModel extends Model<ITagDocument> {
  getTag(_id: string): Promise<ITagDocument>;
  createTag(doc: ITag): Promise<ITagDocument>;
  updateTag(_id: string, doc: ITag): Promise<ITagDocument>;
  removeTag(_id: string): Promise<ITagDocument>;
}

export const loadTagClass = (models: IModels) => {
  class Tag {
    /*
     * Get a tag
     */
    public static async getTag(_id: string) {
      const tag = await models.Tags.findOne({ _id });

      if (!tag) {
        throw new Error('Tag not found');
      }

      return tag;
    }

    /**
     * Create a tag
     */
    public static async createTag(doc: ITag) {
      const isUnique = await this.validateUniqueness(null, doc.name, doc.type);

      if (!isUnique) {
        throw new Error('Tag duplicated');
      }

      const parentTag = await this.getParentTag(doc);

      // Generatingg order
      const order = await this.generateOrder(parentTag, doc);

      const tag = await models.Tags.create({
        ...doc,
        order,
        createdAt: new Date(),
      });

      await setRelatedTagIds(models, tag);

      return tag;
    }

    /**
     * Update Tag
     */
    public static async updateTag(_id: string, doc: ITag) {
      const isUnique = await this.validateUniqueness(
        { _id },
        doc.name,
        doc.type,
      );

      if (!isUnique) {
        throw new Error('Tag duplicated');
      }

      const parentTag = await this.getParentTag(doc);

      if (parentTag && parentTag.parentId === _id) {
        throw new Error('Cannot change tag');
      }

      const tag = await models.Tags.getTag(_id);

      // Generatingg  order
      const order = await this.generateOrder(parentTag, doc);

      const childTags = await models.Tags.find({
        $and: [
          { order: { $regex: new RegExp(escapeRegExp(tag.order || ''), 'i') } },
          { _id: { $ne: _id } },
        ],
      });

      if (childTags.length > 0) {
        const bulkDoc: Array<{
          updateOne: {
            filter: { _id: string };
            update: { $set: { order: string } };
          };
        }> = [];

        // updating child tag order
        childTags.forEach((childTag) => {
          let childOrder = childTag.order || '';

          childOrder = childOrder.replace(tag.order || '', order);

          bulkDoc.push({
            updateOne: {
              filter: { _id: childTag._id },
              update: { $set: { order: childOrder } },
            },
          });
        });

        await models.Tags.bulkWrite(bulkDoc);

        await removeRelatedTagIds(models, tag);
      }

      await models.Tags.updateOne({ _id }, { $set: { ...doc, order } });

      const updated = await models.Tags.findOne({ _id });

      if (updated) {
        await setRelatedTagIds(models, updated);
      }

      return updated;
    }

    /**
     * Remove Tag
     */
    public static async removeTag(_id: string) {
      const tag = await models.Tags.getTag(_id);

      const childCount = await models.Tags.countDocuments({
        parentId: _id,
      });

      if (childCount > 0) {
        throw new Error('Please remove child tags first');
      }

      await removeRelatedTagIds(models, tag);

      return models.Tags.deleteOne({ _id });
    }

    /*
     * Validates tag uniquness
     */
    public static async validateUniqueness(
      selector: any,
      name: string,
      type: string,
    ): Promise<boolean> {
      // required name and type
      if (!name || !type) {
        return true;
      }

      // can't update name & type same time more than one tags.
      const count = await models.Tags.countDocuments(selector);

      if (selector && count > 1) {
        return false;
      }

      const obj = selector && (await models.Tags.findOne(selector));

      const filter: any = { name, type };

      if (obj) {
        filter._id = { $ne: obj._id };
      }

      const existing = await models.Tags.findOne(filter);

      if (existing) {
        return false;
      }

      return true;
    }

    /*
     * Get a parent tag
     */
    static async getParentTag(doc: ITag) {
      return models.Tags.findOne({
        _id: doc.parentId,
      }).lean();
    }

    /**
     * Generating order
     */
    public static async generateOrder(
      parentTag: ITagDocument | null,
      { name }: { name: string },
    ) {
      const order = parentTag ? `${parentTag.order}${name}/` : `${name}/`;

      return order;
    }
  }

  tagSchema.loadClass(Tag);

  return tagSchema;
};
