import { ITag, Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const tagMutations: Record<string, Resolver> = {
  /**
   * Creates a new tag
   */
  async tagsAdd(
    _parent: undefined,
    doc: ITag,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('tagsCreate');

    return await models.Tags.createTag(doc);
  },

  /**
   * Edits a tag
   */
  async tagsEdit(
    _parent: undefined,
    { _id, ...doc }: { _id: string } & ITag,
    { models, __, checkPermission }: IContext,
  ) {
    await checkPermission('tagsUpdate');

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
      action,
    }: { type: string; targetIds: string[]; tagIds: string[]; action?: 'add' | 'remove' },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('tagsTag');

    return await models.Tags.tagsTag(type, targetIds, tagIds, action);
  },

  /**
   * Removes a tag
   */
  async tagsRemove(
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('tagsDelete');

    return models.Tags.removeTag(_id);
  },

  async cpTagsAdd(
    _parent: undefined,
    doc: ITag,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('tagsCreate');

    return await models.Tags.createTag(doc);
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

tagMutations.cpTagsAdd.wrapperConfig = {
  forClientPortal: true,
};
