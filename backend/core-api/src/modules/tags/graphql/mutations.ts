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
    { models, subdomain, processId, user }: IContext,
  ) {
    const [pluginName, moduleName] = type.split(':');

    if (!pluginName || !moduleName) {
      throw new Error(
        `Invalid type format: expected "service:content", got "${type}"`,
      );
    }

    const tags = await models.Tags.find({
      type,
      _id: { $in: tagIds },
      isGroup: { $ne: true },
    });

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

      return await model.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds: tags.map((tag) => tag._id) } },
      );
    }

    return await sendTRPCMessage({
      subdomain,

      pluginName,
      method: 'mutation',
      module: moduleName,
      action: 'tag',
      context: {
        processId,
        userId: user?._id,
      },
      input: {
        tagIds: tags.map((tag) => tag._id),
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
};
