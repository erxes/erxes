import { Segments } from '../../db/models';
import { ISegmentDocument } from '../../db/models/definitions/segments';

export default {
  getSubSegments(segment: ISegmentDocument) {
    return Segments.find({ subOf: segment._id });
  },

  async getConditionSegments(segment: ISegmentDocument) {
    const segmentIds = segment.conditions.map(cond => cond.subSegmentId);

    return Segments.aggregate([
      { $match: { _id: { $in: segmentIds } } },
      { $addFields: { __order: { $indexOfArray: [segmentIds, '$_id'] } } },
      { $sort: { __order: 1 } }
    ]);
  }
};
