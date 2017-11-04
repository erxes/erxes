import { Segments } from '../../../db/models';

import { moduleRequireLogin } from '../../permissions';

const segmentMutations = {
  /**
   * Segments list
   * @return {Promise} segment objects
   */
  segments(root, { contentType }) {
    return Segments.find({ contentType });
  },

  /**
   * Only segment that has no sub segments
   * @return {Promise} segment objects
   */
  segmentsGetHeads() {
    return Segments.find({ subOf: { $exists: false } });
  },

  /**
   * Get one segment
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found segment
   */
  segmentDetail(root, { _id }) {
    return Segments.findOne({ _id });
  },
};

moduleRequireLogin(segmentMutations);

export default segmentMutations;
