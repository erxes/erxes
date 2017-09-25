import { Tags } from '../../../db/models';

export default {
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
