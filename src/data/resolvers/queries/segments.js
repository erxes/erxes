import { Segments } from '../../../db/models';

export default {
  /**
   * Segments list
   * @return {Promise} segment objects
   */
  segments() {
    return Segments.find({});
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
