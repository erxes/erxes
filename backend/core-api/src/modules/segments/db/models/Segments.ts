import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ISegment,
  ISegmentDocument,
  segmentSchema,
} from '../definitions/segments';

const createOrUpdateSubSegments = async (
  models: IModels,
  segments: ISegment[],
) => {
  const updatedSubSegments: Array<{
    subSegmentId: string;
    type: 'subSegment';
  }> = [];

  for (const segment of segments) {
    const { _id } = segment || {};

    if (_id) {
      updatedSubSegments.push({
        subSegmentId: _id,
        type: 'subSegment',
      });

      delete segment._id;

      await models.Segments.updateOne({ _id }, { $set: segment });
      // create
    } else {
      const item = await models.Segments.create(segment);

      updatedSubSegments.push({
        subSegmentId: item._id,
        type: 'subSegment',
      });
    }
  }

  return updatedSubSegments;
};
export interface ISegmentModel extends Model<ISegmentDocument> {
  getSegment(_id: string): Promise<ISegmentDocument>;
  createSegment(
    doc: ISegment,
    conditionSegments: ISegment[],
  ): Promise<ISegmentDocument>;
  updateSegment(
    _id: string,
    doc: ISegment,
    conditionSegments: ISegment[],
  ): Promise<ISegmentDocument>;
  removeSegment(_id: string): Promise<void>;
  removeSegments(ids: string[]): Promise<void>;
}

export const loadSegmentClass = (models: IModels) => {
  class Segment {
    /*
     * Get a segment
     */
    public static async getSegment(_id: string) {
      const segment = await models.Segments.findOne({ _id }).lean();

      if (!segment) {
        throw new Error('Segment not found');
      }

      return segment;
    }

    /**
     * Create a segment
     * @param  {Object} segmentObj object
     * @return {Promise} Newly created segment object
     */
    public static async createSegment(
      doc: ISegment,
      conditionSegments: ISegment[],
    ) {
      const conditions = await createOrUpdateSubSegments(
        models,
        conditionSegments || [],
      );

      doc.conditions = conditions;

      return models.Segments.create(doc);
    }

    /*
     * Update segment
     */
    public static async updateSegment(
      _id: string,
      doc: ISegment,
      conditionSegments: ISegment[],
    ) {
      const conditions = await createOrUpdateSubSegments(
        models,
        conditionSegments || [],
      );

      doc.conditions = conditions;

      await models.Segments.updateOne({ _id }, { $set: doc });

      return models.Segments.findOne({ _id });
    }

    /*
     * Remove segment
     */
    public static async removeSegment(_id: string) {
      const segmentObj = await models.Segments.findOne({ _id });

      const subSegmentIds: string[] = [];

      if (!segmentObj) {
        throw new Error(`Segment not found with id ${_id}`);
      }

      if (segmentObj.conditions) {
        for (const condition of segmentObj.conditions) {
          if (condition.subSegmentId) {
            subSegmentIds.push(condition.subSegmentId);
          }
        }
      }

      await models.Segments.deleteMany({ _id: { $in: subSegmentIds } });
      await segmentObj.deleteOne();
      return segmentObj;
    }

    public static async removeSegments(ids: string[]) {
      const segments = await models.Segments.find({ _id: { $in: ids } }).lean();

      const segmentIds: string[] = [];

      for (const segment of segments) {
        segmentIds.push(segment._id);
        if (segment.conditions) {
          for (const condition of segment.conditions) {
            if (condition.subSegmentId) {
              segmentIds.push(condition.subSegmentId);
            }
          }
        }
      }

      return await models.Segments.deleteMany({ _id: { $in: segmentIds } });
    }
  }

  segmentSchema.loadClass(Segment);

  return segmentSchema;
};
