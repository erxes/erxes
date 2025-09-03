import { tagSchema } from '@/tags/db/definitions/tags';
import { removeRelatedTagIds, setRelatedTagIds } from '@/tags/utils';
import { ITag, ITagDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
export interface ITagModel extends Model<ITagDocument> {
  getTag(_id: string): Promise<ITagDocument>;
  createTag(doc: ITag): Promise<ITagDocument>;
  updateTag(_id: string, doc: ITag): Promise<ITagDocument>;
  removeTag(_id: string): Promise<ITagDocument>;
}

export const loadTagClass = (models: IModels) => {
  class Tag {
    public static async validate(_id: string | null, doc: ITag) {
      const { name, parentId, isGroup } = doc;

      const tag = await models.Tags.findOne({ name });

      if (tag && tag._id !== _id) {
        throw new Error('There is already a tag with this name');
      }

      if (parentId) {
        const parentTag = await models.Tags.findOne({ _id: parentId });

        if (!parentTag?.isGroup) {
          throw new Error('Parent tag must be a group');
        }
      }

      if (isGroup && parentId) {
        throw new Error('Group tag cannot have parent tag');
      }

      if (_id) {
        const existingTag = await models.Tags.findOne({ _id });

        if (isGroup && parentId) {
          throw new Error('Group tag cannot have parent tag');
        }

        if (!existingTag?.isGroup && isGroup && existingTag?.parentId) {
          throw new Error('Cannot convert a nested tag into a group');
        }
      }
    }

    public static async getTag(_id: string) {
      const tag = await models.Tags.findOne({ _id });

      if (!tag) {
        throw new Error('Tag not found');
      }

      return tag;
    }

    public static async createTag(doc: ITag) {
      await this.validate(null, doc);

      const tag = await models.Tags.create(doc);

      await setRelatedTagIds(models, tag);

      return tag;
    }

    public static async updateTag(_id: string, doc: ITag) {
      await this.validate(_id, doc);

      const tag = await models.Tags.getTag(_id);

      const updated = await models.Tags.findOneAndUpdate({ _id }, doc, {
        new: true,
      });

      if (updated) {
        await setRelatedTagIds(models, updated);
      }

      return updated;
    }

    public static async removeTag(_id: string) {
      const tag = await models.Tags.getTag(_id);

      const childTagIds = await models.Tags.find({ parentId: _id }).distinct(
        '_id',
      );

      await models.Tags.updateMany(
        { _id: { $in: childTagIds } },
        { $unset: { parentId: 1 } },
      );

      await removeRelatedTagIds(models, tag);

      return models.Tags.deleteOne({ _id });
    }
  }

  tagSchema.loadClass(Tag);

  return tagSchema;
};
