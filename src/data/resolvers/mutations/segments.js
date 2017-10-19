import { Segments } from '../../../db/models';

export default {
  /**
   * Create new segment
   * @return {Promise} segment object
   */
  segmentsAdd(root, doc, { user }) {
    if (!user) throw new Error('Login required');

    return Segments.createSegment(doc);
  },

  /**
   * Update segment
   * @return {Promise} segment object
   */
  async segmentsEdit(root, { _id, ...doc }, { user }) {
    if (!user) throw new Error('Login required');

    return Segments.updateSegment(_id, doc);
  },

  /**
   * Delete segment
   * @return {Promise}
   */
  async segmentsRemove(root, { _id }, { user }) {
    if (!user) throw new Error('Login required');

    return Segments.removeSegment(_id);
  },
};
