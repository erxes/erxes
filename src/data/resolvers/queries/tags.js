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
};

moduleRequireLogin(tagQueries);

export default tagQueries;
