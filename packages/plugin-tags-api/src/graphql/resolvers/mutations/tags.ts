import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

import { ITag } from '../../../models/definitions/tags';
import { tagObject } from '../../../utils';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  putActivityLog,
} from '../../../logUtils';

interface ITagsEdit extends ITag {
  _id: string;
}

const TAG = 'tag';

const tagMutations = (serviceDiscovery) => ({
  /**
   * Creates a new tag
   */
  async tagsAdd(_root, doc: ITag, { docModifier, models, user }: IContext) {
    const tag = await models.Tags.createTag(docModifier(doc));

    await putCreateLog({ type: TAG, newData: tag, object: tag }, user, models);

    return tag;
  },

  /**
   * Edits a tag
   */
  async tagsEdit(
    _root,
    { _id, ...doc }: ITagsEdit,
    { models, user }: IContext
  ) {
    const tag = await models.Tags.getTag(_id);
    const updated = await models.Tags.updateTag(_id, doc);

    await putUpdateLog({ type: TAG, object: tag, newData: doc }, user, models);

    return updated;
  },

  /**
   * Removes a tag
   */
  async tagsRemove(
    _root,
    { _id }: { _id: string },
    { models, user }: IContext
  ) {
    const tag = await models.Tags.findOne({ _id });
    const removed = await models.Tags.removeTag(_id);

    await putDeleteLog({ type: TAG, object: tag }, models, user);

    return removed;
  },

  /**
   * Attach a tag
   */
  async tagsTag(
    _root,
    {
      type,
      targetIds,
      tagIds,
    }: { type: string; targetIds: string[]; tagIds: string[] },
    { models, user }: IContext
  ) {
    // if (type === 'conversation') {
    //   publishConversationsChanged(targetIds, MODULE_NAMES.TAG);
    // }

    const prevTagsCount = await models.Tags.find({
      _id: { $in: tagIds },
      type,
    }).countDocuments();

    if (prevTagsCount !== tagIds.length) {
      throw new Error('Tag not found.');
    }

    const targets = await tagObject(type, tagIds, targetIds, serviceDiscovery);

    for (const target of targets) {
      await putActivityLog({
        action: 'createTagLog',
        data: {
          contentId: target._id,
          userId: user ? user._id : '',
          contentType: type,
          target,
          content: { tagIds: tagIds || [] },
          createdBy: user._id,
          action: 'tagged',
        },
      });
    }
  },

  tagsMerge(
    _root,
    { sourceId, destId }: { sourceId: string; destId: string },
    { models }: IContext
  ) {
    return models.Tags.merge(sourceId, destId);
  },
});

requireLogin(tagMutations, 'tagsTag');

checkPermission(tagMutations, 'tagsAdd', 'manageTags');
checkPermission(tagMutations, 'tagsEdit', 'manageTags');
checkPermission(tagMutations, 'tagsRemove', 'manageTags');
checkPermission(tagMutations, 'tagsMerge', 'manageTags');

export default tagMutations;
