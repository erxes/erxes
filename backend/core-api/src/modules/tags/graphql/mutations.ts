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
    //tagsEdit
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
    return await models.Tags.tagsTag(type, targetIds, tagIds);
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
