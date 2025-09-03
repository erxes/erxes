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

      const tag = await models.Tags.findOne({
        $or: [{ _id }, { name }],
      }).lean();

      if (tag?.name === name) {
        throw new Error(`A tag named ${name} already exists`);
      }

      if (tag?.isGroup && isGroup) {
        throw new Error('Nested group is not allowed 1');
      }

      if (String(_id) === String(parentId)) {
        throw new Error('Group cannot be itself');
      }

      if (parentId) {
        const parentTag = await models.Tags.findOne({ _id: parentId }).lean();

        if (!parentTag) {
          throw new Error('Group not found');
        }

        if (!parentTag.isGroup) {
          throw new Error('Parent tag must be a group');
        }

        if ((isGroup || tag?.isGroup) && parentTag?.isGroup) {
          throw new Error('Nested group is not allowed 2 ');
        }
      }

      if (tag) {
        const parentTag = await models.Tags.findOne({ _id: tag.parentId }).lean();
        const childTags = await models.Tags.find({ parentId: tag._id }).lean();

        if (parentTag?.isGroup && isGroup) {
          throw new Error('Nested group is not allowed 3');
        }

        if (!isGroup && childTags.length) {
          throw new Error('Group has tags');
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

      const childTags = await models.Tags.find({ parentId: tag._id });

      if (childTags.length) {
        await removeRelatedTagIds(models, tag);
      }

      const updated = await models.Tags.findOneAndUpdate(
        { _id: tag._id },
        doc,
        {
          new: true,
        },
      );

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
