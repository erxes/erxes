import { IContext } from "../../connectionResolver";
import { ISegmentDocument } from "../../models/definitions/segments";
import { fetchSegment } from "./queries/queryBuilder";

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Segments.findOne({ _id });
  },
  async getSubSegments(
    segment: ISegmentDocument,
    _args,
    { models }: IContext
  ) {
    return models.Segments.find({
      subOf: { $in: [segment._id] }
    }).lean();
  },

  async count(segment: ISegmentDocument, _args, { models, subdomain }: IContext) {
    const result = await fetchSegment(models, subdomain, segment, { returnCount: true });
    return result;
  },

  async subSegmentConditions(segment: ISegmentDocument, _args, { models }: IContext) {
    const segmentIds = segment.conditions.map(cond => cond.subSegmentId);

    return models.Segments.aggregate([
      { $match: { _id: { $in: segmentIds } } },
      { $addFields: { __order: { $indexOfArray: [segmentIds, '$_id'] } } },
      { $sort: { __order: 1 } }
    ]);
  }
};