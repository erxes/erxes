import { Tags } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

const tagQueries = {
  /**
   * Tags list
   */
  tags(_root, { type }: { type: string }, { commonQuerySelector }: IContext) {
    return Tags.find({ ...commonQuerySelector, type }).sort({ name: 1 });
  },

  /**
   * Get one tag
   */
  tagDetail(_root, { _id }: { _id: string }) {
    return Tags.findOne({ _id });
  },
};

requireLogin(tagQueries, 'tagDetail');
checkPermission(tagQueries, 'tags', 'showTags', []);

export default tagQueries;
