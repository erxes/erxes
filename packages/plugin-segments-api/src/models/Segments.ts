import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  ISegment,
  ISegmentDocument,
  segmentSchema
} from './definitions/segments';

const createOrUpdateSubSegments = async (
  models: IModels,
  segments: ISegment[]
) => {
  const updatedSubSugments: Array<{
    subSegmentId: string;
    type: 'subSegment';
  }> = [];

  for (const segment of segments) {
    const _id = segment._id;

    if (_id) {
      updatedSubSugments.push({
        subSegmentId: _id,
        type: 'subSegment'
      });

      delete segment._id;

      await models.Segments.updateOne({ _id }, { $set: segment });
      // create
    } else {
      const item = await models.Segments.create(segment);

      updatedSubSugments.push({
        subSegmentId: item._id,
        type: 'subSegment'
      });
    }
  }

  return updatedSubSugments;
};
export interface ISegmentModel extends Model<ISegmentDocument> {
  getSegment(_id: string): Promise<ISegmentDocument>;
  createSegment(
    doc: ISegment,
    conditionSegments: ISegment[]
  ): Promise<ISegmentDocument>;
  updateSegment(
    _id: string,
    doc: ISegment,
    conditionSegments: ISegment[]
  ): Promise<ISegmentDocument>;
  removeSegment(_id: string): void;
}

export const loadClass = (models: IModels) => {
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
      conditionSegments: ISegment[]
    ) {
      const conditions = await createOrUpdateSubSegments(
        models,
        conditionSegments || []
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
      conditionSegments: ISegment[]
    ) {
      const conditions = await createOrUpdateSubSegments(
        models,
        conditionSegments || []
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

      await models.Segments.remove({ _id: { $in: subSegmentIds } });

      return segmentObj.remove();
    }
  }

  segmentSchema.loadClass(Segment);

  return segmentSchema;
};
