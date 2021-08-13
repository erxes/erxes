import { Segments } from '../../db/models';
import { ISegmentDocument } from '../../db/models/definitions/segments';

export default {
  getSubSegments(segment: ISegmentDocument) {
    return Segments.find({ subOf: segment._id });
  },

  getConditionSegments(segment: ISegmentDocument) {
    const segmentIds = segment.conditions.map(cond => cond.subSegmentId);

    return Segments.find({ _id: { $in: segmentIds.reverse() } });
  }
};
