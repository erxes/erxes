import { checkPermission, requireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '@erxes/api-utils/src/types';
import { Tags } from '../../../models';
import { ITag } from '../../../models/definitions/tags';
import { tagObject } from '../../../utils';

interface ITagsEdit extends ITag {
  _id: string;
}

const tagMutations = {
  /**
   * Creates a new tag
   */
  async tagsAdd(_root, doc: ITag, context: IContext) {
    const tag = await Tags.createTag(context.docModifier(doc));

    // await putCreateLog(
    //   {
    //     type: MODULE_NAMES.TAG,
    //     newData: tag,
    //     object: tag,
    //     description: `"${tag.name}" has been created`
    //   },
    //   user
    // );

    return tag;
  },

  /**
   * Edits a tag
   */
  async tagsEdit(_root, { _id, ...doc }: ITagsEdit, { user }: IContext) {
    const tag = await Tags.getTag(_id);
    const updated = await Tags.updateTag(_id, doc);

    // await putUpdateLog(
    //   {
    //     type: MODULE_NAMES.TAG,
    //     object: tag,
    //     newData: doc,
    //     description: `"${tag.name}" has been edited`
    //   },
    //   user
    // );

    return updated;
  },

  /**
   * Removes a tag
   */
  async tagsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const tag = await Tags.findOne({ _id });
    const removed = await Tags.removeTag(_id);

    // await putDeleteLog(
    //   {
    //     type: MODULE_NAMES.TAG,
    //     object: tag,
    //     description: `"${tag && tag.name}" has been removed`
    //   },
    //   user
    // );

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
      tagIds
    }: { type: string; targetIds: string[]; tagIds: string[] },
    { user }: IContext
  ) {
    // if (type === 'conversation') {
    //   publishConversationsChanged(targetIds, MODULE_NAMES.TAG);
    // }

      const prevTagsCount = await Tags.find({
        _id: { $in: tagIds },
        type
      }).countDocuments();

      if (prevTagsCount !== tagIds.length) {
        throw new Error('Tag not found.');
      }

      const targets = await tagObject(type, tagIds, targetIds);

      for (const target of targets) {
        // await putActivityLog({
        //   action: ACTIVITY_LOG_ACTIONS.CREATE_TAG_LOG,
        //   data: {
        //     contentId: target._id,
        //     userId: user ? user._id : '',
        //     contentType: type,
        //     target,
        //     content: { tagIds: tagIds || [] }
        //   }
        // });
      }
  },

  tagsMerge(_root, { sourceId, destId }: { sourceId: string; destId: string }) {
    return Tags.merge(sourceId, destId);
  }
};

requireLogin(tagMutations, 'tagsTag');

checkPermission(tagMutations, 'tagsAdd', 'manageTags');
checkPermission(tagMutations, 'tagsEdit', 'manageTags');
checkPermission(tagMutations, 'tagsRemove', 'manageTags');
checkPermission(tagMutations, 'tagsMerge', 'manageTags');

export default tagMutations;
