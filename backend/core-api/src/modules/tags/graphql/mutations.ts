import { ITag } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const tagMutations = {
  /**
   * Creates a new tag
   */
  async tagsAdd(_parent: undefined, doc: ITag, { models }: IContext) {
    return await models.Tags.createTag(doc);
  },

  /**
   * Edits a tag
   */
  async tagsEdit(
    _parent: undefined,
    { _id, ...doc }: { _id: string } & ITag,
    { models, __ }: IContext,
  ) {
    return await models.Tags.updateTag(_id, __(doc));
  },

  /**
   * Attach a tag
   */
  async tagsTag(
    _parent: undefined,
    {
      type,
      targetIds,
      tagIds,
    }: { type: string; targetIds: string[]; tagIds: string[] },
    { models }: IContext,
  ) {
    const [pluginName, moduleName] = type.split(':');

    if (!pluginName || !moduleName) {
      throw new Error(
        `Invalid type format: expected "service:content", got "${type}"`,
      );
    }

    const existingTagsCount = await models.Tags.countDocuments({
      _id: { $in: tagIds },
      type,
    });

    if (existingTagsCount !== tagIds.length) {
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

      return await model.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
      );
    }

    return await sendTRPCMessage({
      pluginName,
      method: 'mutation',
      module: moduleName,
      action: 'tag',
      input: {
        tagIds,
        targetIds,
        type: moduleName,
        action: 'tagObject',
      },
    });
  },

  /**
   * Removes a tag
   */
  async tagsRemove(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Tags.removeTag(_id);
  },

  /**
   * Merge tags
   */
  async tagsMerge(
    _parent: undefined,
    { sourceId, destId }: { sourceId: string; destId: string },
    { models }: IContext,
  ) {
    // remove old tag
    await models.Tags.removeTag(sourceId);

    return models.Tags.getTag(destId);
  },
};
