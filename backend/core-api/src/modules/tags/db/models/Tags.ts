import { tagSchema } from '@/tags/db/definitions/tags';
import {
  buildBulkActivities,
  EventDispatcherReturn,
} from 'erxes-api-shared/core-modules';
import { ITag, ITagDocument } from 'erxes-api-shared/core-types';
import { escapeRegExp, sendTRPCMessage } from 'erxes-api-shared/utils';
import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
export interface ITagModel extends Model<ITagDocument> {
  getTag(_id: string): Promise<ITagDocument>;
  createTag(doc: ITag): Promise<ITagDocument>;
  updateTag(_id: string, doc: ITag): Promise<ITagDocument>;
  removeTag(_id: string): Promise<ITagDocument>;
  tagsTag(
    type: string,
    targetIds: string[],
    tagIds: string[],
  ): Promise<ITagDocument>;
}

export const loadTagClass = (
  subdomain: string,
  models: IModels,
  { sendDbEventLog, createActivityLog, getContext }: EventDispatcherReturn,
) => {
  class Tag {
    public static async validate(_id: string | null, doc: ITag) {
      const { name, type, parentId, isGroup } = doc;

      const existingTag = await models.Tags.findOne({
        name,
        type,
        _id: { $ne: _id },
      }).lean();

      if (existingTag) {
        throw new Error(`A tag named ${name} already exists`);
      }

      const tag = _id ? await models.Tags.findOne({ _id }).lean() : null;

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
        const parentTag = await models.Tags.findOne({
          _id: tag.parentId,
        }).lean();

        const childTags = await models.Tags.find({ parentId: tag._id }).lean();

        if (parentTag?.isGroup && isGroup) {
          throw new Error('Nested group is not allowed 3');
        }

        if (!tag.isGroup && childTags.length) {
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

      const order = await this.generateOrder(doc);

      const tag = await models.Tags.create({
        ...doc,
        order,
      });

      await this.setRelatedTagIds(tag);
      sendDbEventLog({
        action: 'create',
        docId: tag._id,
        currentDocument: tag.toObject(),
      });

      return tag;
    }

    public static async updateTag(_id: string, doc: ITag) {
      await this.validate(_id, doc);

      const tag = await models.Tags.getTag(_id);

      if (tag.isGroup && !doc.isGroup) {
        const childTags = await models.Tags.find({ parentId: _id }).lean();

        if (childTags.length) {
          await models.Tags.updateMany(
            { _id: { $in: childTags.map((tag) => tag._id) } },
            { $unset: { parentId: 1 } },
          );
        }
      }

      const order = await this.generateOrder(doc);

      const childTags = await models.Tags.find({
        $and: [
          { _id: { $ne: _id } },
          { order: { $regex: new RegExp(escapeRegExp(tag.order || ''), 'i') } },
        ],
      });

      if (childTags.length) {
        const bulkDoc: Array<{
          updateOne: {
            filter: { _id: string };
            update: { $set: { order: string } };
          };
        }> = [];

        // updating child categories order
        childTags.forEach(async (childTag) => {
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

        await this.removeRelatedTagIds(tag);
      }

      const updated = await models.Tags.findOneAndUpdate(
        { _id: tag._id },
        {
          ...doc,
          order,
        },
        {
          new: true,
        },
      );

      if (updated) {
        await this.setRelatedTagIds(updated);
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

      await this.removeRelatedTagIds(tag);

      return models.Tags.deleteOne({ _id });
    }

    public static async tagsTag(
      type: string,
      targetIds: string[],
      tagIds: string[],
    ) {
      const [pluginName, moduleName] = type.split(':');

      if (!pluginName || !moduleName) {
        throw new Error(
          `Invalid type format: expected "service:content", got "${type}"`,
        );
      }

      const query: FilterQuery<ITagDocument> = {
        _id: { $in: tagIds },
        isGroup: { $ne: true },
      }


      const tags = await models.Tags.find(query);

      if (tags.length !== tagIds.length) {
        throw new Error('Tag not found.');
      }

      if (pluginName === 'core') {
        const modelMap = {
          customer: models.Customers,
          user: models.Users,
          company: models.Companies,
          form: models.Forms,
          product: models.Products,
          automation: models.Automations,
        };

        const model = modelMap[moduleName];

        if (!model) {
          throw new Error(`Unknown content type: ${moduleName}`);
        }
        const targets = await model
          .find({ _id: { $in: targetIds } }, { tagIds: 1 })
          .lean();

        const result = await model.updateMany(
          { _id: { $in: targetIds } },
          { $set: { tagIds: tags.map((tag) => tag._id) } },
        );

        if (['customer', 'user', 'company', 'product'].includes(moduleName)) {
          buildBulkActivities(
            targets,
            { tagIds },
            {
              field: 'tagIds',
              getContextNames: async (ids) => {
                const tags = await models.Tags.find({ _id: { $in: ids } });
                return tags.map((tag) => tag.name);
              },
              activityTypeMap: {
                array: 'tag',
              },
              actionTypeMap: {
                added: 'tag',
                removed: 'untag',
              },
            },
            createActivityLog,
            {
              pluginName: 'core',
              moduleName: {
                customer: 'contact',
                user: 'organization',
                company: 'contact',
                product: 'product',
              }[moduleName],
              collectionName: `${moduleName}s`,
            },
          );
        }

        return result;
      }

      const { processId, userId } = getContext();

      return await sendTRPCMessage({
        subdomain,

        pluginName,
        method: 'mutation',
        module: moduleName,
        action: 'tag',
        context: {
          processId,
          userId,
        },
        input: {
          tagIds: tags.map((tag) => tag._id),
          targetIds,
          type: moduleName,
          action: 'tagObject',
        },
      });
    }

    public static async generateOrder({ name, parentId }: ITag) {
      const tag = await models.Tags.findOne({ _id: parentId }).lean();

      const order = tag?.order ? `${tag.order}${name}/` : `${name}/`;

      return order;
    }

    static async setRelatedTagIds(tag: ITagDocument) {
      if (!tag.parentId) {
        return;
      }

      const parentTag = await models.Tags.findOne({ _id: tag.parentId });

      if (!parentTag) {
        return;
      }

      const relatedIds: string[] = [tag._id, ...(tag.relatedIds || [])];

      await models.Tags.updateOne(
        { _id: parentTag._id },
        {
          $set: {
            relatedIds: [
              ...new Set([...relatedIds, ...(parentTag.relatedIds || [])]),
            ],
          },
        },
      );

      const updated = await models.Tags.findOne({ _id: tag.parentId });

      if (updated) {
        sendDbEventLog({
          action: 'update',
          docId: updated._id,
          currentDocument: updated.toObject(),
          prevDocument: tag.toObject(),
        });
        await this.setRelatedTagIds(updated);
      }
    }

    static async removeRelatedTagIds(tag: ITagDocument) {
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
        const ids = (t.relatedIds || []).filter(
          (id) => !relatedIds.includes(id),
        );

        doc.push({
          updateOne: {
            filter: { _id: t._id },
            update: { $set: { relatedIds: ids } },
          },
        });
      });

      await models.Tags.bulkWrite(doc);

      sendDbEventLog({
        action: 'bulkWrite',
        docIds: tags.map((t) => t._id),
        updateDescription: doc,
      });
    }
  }

  tagSchema.loadClass(Tag);

  return tagSchema;
};
