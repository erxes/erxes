import { Model, model } from "mongoose";
import { ISegmentDocument, segmentSchema } from "./definitions/segments";

interface IConditionInput {
  field: string;
  operator: string;
  type: string;
  value?: string;
  dateUnit?: string;
}

interface ISegmentInput {
  contentType: string;
  name: string;
  description?: string;
  subOf: string;
  color: string;
  connector: string;
  conditions: IConditionInput[];
}

interface ISegmentModel extends Model<ISegmentDocument> {
  createSegment(doc: ISegmentInput): Promise<ISegmentDocument>;
  updateSegment(_id: string, doc: ISegmentInput): Promise<ISegmentDocument>;
  removeSegment(_id: string): void;
}

class Segment {
  /**
   * Create a segment
   * @param  {Object} segmentObj object
   * @return {Promise} Newly created segment object
   */
  public static createSegment(doc) {
    return Segments.create(doc);
  }

  /*
   * Update segment
   */
  public static async updateSegment(_id, doc) {
    await Segments.update({ _id }, { $set: doc });

    return Segments.findOne({ _id });
  }

  /*
   * Remove segment
   */
  public static async removeSegment(_id) {
    const segmentObj = await Segments.findOne({ _id });

    if (!segmentObj) {
      throw new Error(`Segment not found with id ${_id}`);
    }

    return segmentObj.remove();
  }
}

segmentSchema.loadClass(Segment);

const Segments = model<ISegmentDocument, ISegmentModel>(
  "segments",
  segmentSchema
);

export default Segments;
