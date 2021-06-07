import { Tags } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';

const tagQueries = {
  /**
   * Tags list
   */
  tags(_root, { type, searchValue }: { type: string; searchValue?: string }) {
    const selector: any = { type };

    if (searchValue) {
      selector.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return Tags.find(selector).sort({
      order: 1,
      name: 1
    });
  },

  /**
   * Get one tag
   */
  tagDetail(_root, { _id }: { _id: string }) {
    return Tags.findOne({ _id });
  }
};

requireLogin(tagQueries, 'tagDetail');
checkPermission(tagQueries, 'tags', 'showTags', []);

export default tagQueries;
