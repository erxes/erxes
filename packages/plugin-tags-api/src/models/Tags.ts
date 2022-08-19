import { escapeRegExp } from '@erxes/api-utils/src/core';
import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { ITag, ITagDocument, tagSchema } from './definitions/tags';

// set related tags
const setRelatedIds = async (models: IModels, tag: ITagDocument) => {
  if (tag.parentId) {
    const parentTag = await models.Tags.findOne({ _id: tag.parentId });

    if (parentTag) {
      let relatedIds: string[];

      relatedIds = tag.relatedIds || [];
      relatedIds.push(tag._id);

      relatedIds = _.union(relatedIds, parentTag.relatedIds || []);

      await models.Tags.updateOne(
        { _id: parentTag._id },
        { $set: { relatedIds } }
      );

      const updated = await models.Tags.findOne({ _id: tag.parentId });

      if (updated) {
        await setRelatedIds(models, updated);
      }
    }
  }
};

// remove related tags
const removeRelatedIds = async (models: IModels, tag: ITagDocument) => {
  const tags = await models.Tags.find({ relatedIds: { $in: tag._id } });

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

  tags.forEach(async (t) => {
    const ids = (t.relatedIds || []).filter((id) => !relatedIds.includes(id));

    doc.push({
      updateOne: {
        filter: { _id: t._id },
        update: { $set: { relatedIds: ids } },
      },
    });
  });

  await models.Tags.bulkWrite(doc);
};

export interface ITagModel extends Model<ITagDocument> {
  getTag(_id: string): Promise<ITagDocument>;
  createTag(doc: ITag): Promise<ITagDocument>;
  updateTag(_id: string, doc: ITag): Promise<ITagDocument>;
  removeTag(_id: string): void;
  validateUniqueness(
    selector: any,
    name: string,
    type: string
  ): Promise<boolean>;
}

export const loadTagClass = (models) => {
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
      const count = await models.Tags.find(selector).countDocuments();

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
     * Create a tag
     */
    public static async createTag(doc: ITag) {
      const isUnique = await models.Tags.validateUniqueness(
        null,
        doc.name,
        doc.type
      );

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

      await setRelatedIds(models, tag);

      return tag;
    }

    /**
     * Update Tag
     */
    public static async updateTag(_id: string, doc: ITag) {
      const isUnique = await models.Tags.validateUniqueness(
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

      const tag = await models.Tags.findOne({
        _id,
      });

      if (tag && tag.order) {
        const childTags = await models.Tags.find({
          $and: [
            { order: { $regex: new RegExp(escapeRegExp(tag.order), 'i') } },
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

          // updating child categories order
          childTags.forEach(async (childTag) => {
            let childOrder = childTag.order;

            if (tag.order && childOrder) {
              childOrder = childOrder.replace(tag.order, order);

              bulkDoc.push({
                updateOne: {
                  filter: { _id: childTag._id },
                  update: { $set: { order: childOrder } },
                },
              });
            }
          });

          await models.Tags.bulkWrite(bulkDoc);

          await removeRelatedIds(models, tag);
        }
      }

      await models.Tags.updateOne({ _id }, { $set: { ...doc, order } });

      const updated = await models.Tags.findOne({ _id });

      if (updated) {
        await setRelatedIds(models, updated);
      }

      return updated;
    }

    /**
     * Remove Tag
     */
    public static async removeTag(_id: string) {
      const tag = await models.Tags.getTag(_id);

      const childCount = await models.Tags.countDocuments({ parentId: _id });

      if (childCount > 0) {
        throw new Error('Please remove child tags first');
      }

      await removeRelatedIds(models, tag);

      return models.Tags.deleteOne({ _id });
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

        await models.Tags.updateOne(
          {
            _id: parentTag._id,
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
