import { Segments } from '../../db/models';
import { ISegmentDocument } from '../../db/models/definitions/segments';

export default {
  getParentSegment(segment: ISegmentDocument) {
    return Segments.findOne(segment.subOf);
  },

  getSubSegments(segment: ISegmentDocument) {
    return Segments.find({ subOf: segment._id });
  },
};
