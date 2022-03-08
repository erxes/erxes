import { IContext } from "@erxes/api-utils/src/types";
import { Segments } from "../../models";
import { ISegmentDocument } from "../../models/definitions/segments";
import { fetchSegment } from "./queries/queryBuilder";

export default {
  __resolveReference({ _id }) {
    return Segments.findOne({ _id });
  },
  async getSubSegments(
    segment: ISegmentDocument,
  ) {
    return Segments.find({
      subOf: { $in: [segment._id] }
    }).lean();
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