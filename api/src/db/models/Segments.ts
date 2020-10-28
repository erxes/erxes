import { Model, model } from 'mongoose';
import {
  ISegment,
  ISegmentDocument,
  segmentSchema
} from './definitions/segments';

export interface ISegmentModel extends Model<ISegmentDocument> {
  getSegment(_id: string): Promise<ISegmentDocument>;
  createSegment(doc: ISegment): Promise<ISegmentDocument>;
  updateSegment(_id: string, doc: ISegment): Promise<ISegmentDocument>;
  removeSegment(_id: string): void;
}

export const loadClass = () => {
  class Segment {
    /*
     * Get a segment
     */
    public static async getSegment(_id: string) {
      const segment = await Segments.findOne({ _id });

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
    public static createSegment(doc: ISegment) {
      return Segments.create(doc);
    }

    /*
     * Update segment
     */
    public static async updateSegment(_id: string, doc: ISegment) {
      await Segments.updateOne({ _id }, { $set: doc });

      return Segments.findOne({ _id });
    }

    /*
     * Remove segment
     */
    public static async removeSegment(_id: string) {
      const segmentObj = await Segments.findOne({ _id });

      if (!segmentObj) {
        throw new Error(`Segment not found with id ${_id}`);
      }

      return segmentObj.remove();
    }
  }

  segmentSchema.loadClass(Segment);

  return segmentSchema;
};

loadClass();

// tslint:disable-next-line
const Segments = model<ISegmentDocument, ISegmentModel>(
  'segments',
  segmentSchema
);

export default Segments;
