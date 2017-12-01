import { Segments } from '../../../db/models';

import { moduleRequireLogin } from '../../permissions';

const segmentMutations = {
  /**
   * Create new segment
   * @return {Promise} segment object
   */
  segmentsAdd(root, doc) {
    return Segments.createSegment(doc);
  },

  /**
   * Update segment
   * @return {Promise} segment object
   */
  async segmentsEdit(root, { _id, ...doc }) {
    return Segments.updateSegment(_id, doc);
  },

  /**
   * Delete segment
   * @return {Promise}
   */
  async segmentsRemove(root, { _id }) {
    return Segments.removeSegment(_id);
  },
};

moduleRequireLogin(segmentMutations);

export default segmentMutations;
