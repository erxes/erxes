import { Tags } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const tagQueries = {
  /**
   * Tags list
   * @param {Object} args
   * @param {Strign} args.type
   * @return {Promise} filtered tag objects by type
   */
  tags(root, { type }) {
    return Tags.find({ type });
  },

  /**
   * Get one tag
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found tag
   */
  tagDetail(root, { _id }) {
    return Tags.findOne({ _id });
  },
};

moduleRequireLogin(tagQueries);

export default tagQueries;
