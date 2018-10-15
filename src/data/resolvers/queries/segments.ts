import { Segments } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const segmentQueries = {
  /**
   * Segments list
   */
  segments(_root, { contentType }: { contentType: string }) {
    return Segments.find({ contentType }).sort({ name: 1 });
  },

  /**
   * Only segment that has no sub segments
   */
  segmentsGetHeads() {
    return Segments.find({ subOf: { $exists: false } });
  },

  /**
   * Get one segment
   */
  segmentDetail(_root, { _id }: { _id: string }) {
    return Segments.findOne({ _id });
  },
};

moduleRequireLogin(segmentQueries);

export default segmentQueries;
