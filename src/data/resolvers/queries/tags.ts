import { Tags } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const tagQueries = {
  /**
   * Tags list
   */
  tags(_root, { type }: { type: string }) {
    return Tags.find({ type }).sort({ name: 1 });
  },

  /**
   * Get one tag
   */
  tagDetail(_root, { _id }: { _id: string }) {
    return Tags.findOne({ _id });
  },
};

moduleRequireLogin(tagQueries);

export default tagQueries;
