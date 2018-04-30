import { Segments } from '../../../db/models';

import { moduleRequireLogin } from '../../permissions';

const segmentQueries = {
  /**
   * Segments list
   * @return {Promise} segment objects
   */
  segments(root, { contentType }) {
    return Segments.find({ contentType }).sort({ name: 1 });
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

moduleRequireLogin(segmentQueries);

export default segmentQueries;
