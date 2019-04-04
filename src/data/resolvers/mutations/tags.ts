import { Tags } from '../../../db/models';
import { ITag } from '../../../db/models/definitions/tags';
import { checkPermission, requireLogin } from '../../permissions';
import { publishConversationsChanged } from './conversations';

interface ITagsEdit extends ITag {
  _id: string;
}

const tagMutations = {
  /**
   * Create new tag
   */
  tagsAdd(_root, doc: ITag) {
    return Tags.createTag(doc);
  },

  /**
   * Edit tag
   */
  tagsEdit(_root, { _id, ...doc }: ITagsEdit) {
    return Tags.updateTag(_id, doc);
  },

  /**
   * Remove tag
   */
  tagsRemove(_root, { ids }: { ids: string[] }) {
    return Tags.removeTag(ids);
  },

  /**
   * Attach a tag
   */
  tagsTag(_root, { type, targetIds, tagIds }: { type: string; targetIds: string[]; tagIds: string[] }) {
    if (type === 'conversation') {
      publishConversationsChanged(targetIds, 'tag');
    }

    return Tags.tagsTag(type, targetIds, tagIds);
  },
};

requireLogin(tagMutations, 'tagsTag');

checkPermission(tagMutations, 'tagsAdd', 'manageTags');
checkPermission(tagMutations, 'tagsEdit', 'manageTags');
checkPermission(tagMutations, 'tagsRemove', 'manageTags');

export default tagMutations;
