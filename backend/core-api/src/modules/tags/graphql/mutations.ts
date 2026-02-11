import { ITag, Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const tagMutations: Record<string, Resolver> = {
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

  /**
   * Attach a cp tag
   */
  async cpTagsTag(
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
};

tagMutations.cpTagsTag.wrapperConfig = {
  forClientPortal: true,
};
