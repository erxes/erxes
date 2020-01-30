import { Tags } from '../../../db/models';
import { ITag } from '../../../db/models/definitions/tags';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { publishConversationsChanged } from './conversations';

interface ITagsEdit extends ITag {
  _id: string;
}

const tagMutations = {
  /**
   * Creates a new tag
   */
  async tagsAdd(_root, doc: ITag, { user, docModifier }: IContext) {
    const tag = await Tags.createTag(docModifier(doc));

    await putCreateLog(
      {
        type: MODULE_NAMES.TAG,
        newData: tag,
        object: tag,
        description: `"${tag.name}" has been created`,
      },
      user,
    );

    return tag;
  },

  /**
   * Edits a tag
   */
  async tagsEdit(_root, { _id, ...doc }: ITagsEdit, { user }: IContext) {
    const tag = await Tags.getTag(_id);
    const updated = await Tags.updateTag(_id, doc);

    await putUpdateLog(
      {
        type: MODULE_NAMES.TAG,
        object: tag,
        newData: doc,
        description: `"${tag.name}" has been edited`,
      },
      user,
    );

    return updated;
  },

  /**
   * Removes a tag
   */
  async tagsRemove(_root, { ids }: { ids: string[] }, { user }: IContext) {
    const tags = await Tags.find({ _id: { $in: ids } });
    const removed = await Tags.removeTag(ids);

    for (const tag of tags) {
      await putDeleteLog(
        {
          type: MODULE_NAMES.TAG,
          object: tag,
          description: `"${tag.name}" has been removed`,
        },
        user,
      );
    }

    return removed;
  },

  /**
   * Attach a tag
   */
  tagsTag(_root, { type, targetIds, tagIds }: { type: string; targetIds: string[]; tagIds: string[] }) {
    if (type === 'conversation') {
      publishConversationsChanged(targetIds, MODULE_NAMES.TAG);
    }

    return Tags.tagsTag(type, targetIds, tagIds);
  },
};

requireLogin(tagMutations, 'tagsTag');

checkPermission(tagMutations, 'tagsAdd', 'manageTags');
checkPermission(tagMutations, 'tagsEdit', 'manageTags');
checkPermission(tagMutations, 'tagsRemove', 'manageTags');

export default tagMutations;
