import { Segments } from '../../db/models';
import { ISegmentDocument } from '../../db/models/definitions/segments';
import { fetchSegment } from '../modules/segments/queryBuilder';
import { IContext } from '../types';

export default {
  async getSubSegments(
    segment: ISegmentDocument,
    _,
    { dataLoaders }: IContext
  ) {
    const subSegments = await dataLoaders.segmentsBySubOf.load(segment._id);
    return subSegments.filter(subSegment => subSegment);
  },

  async count(segment: ISegmentDocument) {
    const result = await fetchSegment(segment, { returnCount: true });
    return result;
  },

  async subSegmentConditions(segment: ISegmentDocument) {
    const segmentIds = segment.conditions.map(cond => cond.subSegmentId);

    return Segments.aggregate([
      { $match: { _id: { $in: segmentIds } } },
      { $addFields: { __order: { $indexOfArray: [segmentIds, '$_id'] } } },
      { $sort: { __order: 1 } }
    ]);
  }
};
