import { Segments } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

const segmentQueries = {
  /**
   * Segments list
   */
  segments(_root, { contentType }: { contentType: string }, { commonQuerySelector }: IContext) {
    return Segments.find({ ...commonQuerySelector, contentType }).sort({ name: 1 });
  },

  /**
   * Only segment that has no sub segments
   */
  async segmentsGetHeads(_root, _args, { commonQuerySelector }: IContext) {
    return Segments.find({ ...commonQuerySelector, $or: [{ subOf: { $exists: false } }, { subOf: '' }] });
  },

  /**
   * Get one segment
   */
  segmentDetail(_root, { _id }: { _id: string }) {
    return Segments.findOne({ _id });
  },
};

requireLogin(segmentQueries, 'segmentsGetHeads');
requireLogin(segmentQueries, 'segmentDetail');

checkPermission(segmentQueries, 'segments', 'showSegments', []);

export default segmentQueries;
