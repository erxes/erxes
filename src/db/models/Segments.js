import * as mongoose from 'mongoose';
import { COC_CONTENT_TYPES } from '../../data/constants';
import { field } from './utils';

const ConditionSchema = mongoose.Schema(
  {
    field: field({ type: String }),
    operator: field({ type: String }),
    type: field({ type: String }),

    value: field({
      type: String,
      optional: true,
    }),

    dateUnit: field({
      type: String,
      optional: true,
    }),
  },
  { _id: false },
);

const SegmentSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  contentType: field({
    type: String,
    enum: COC_CONTENT_TYPES.ALL,
  }),
  name: field({ type: String }),
  description: field({ type: String, optional: true }),
  subOf: field({ type: String }),
  color: field({ type: String }),
  connector: field({ type: String }),
  conditions: field({ type: [ConditionSchema] }),
});

class Segment {
  /**
   * Create a segment
   * @param  {Object} segmentObj object
   * @return {Promise} Newly created segment object
   */
  static createSegment(doc) {
    return this.create(doc);
  }

  /*
   * Update segment
   * @param {String} _id segment id to update
   * @param {Object} doc field values to update
   * @return {Promise} updated segment object
   */
  static async updateSegment(_id, doc) {
    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /*
   * Remove segment
   * @param {String} _id segment id to remove
   * @return {Promise}
   */
  static async removeSegment(_id) {
    const segmentObj = await this.findOne({ _id });

    if (!segmentObj) throw new Error(`Segment not found with id ${_id}`);

    return segmentObj.remove();
  }
}

SegmentSchema.loadClass(Segment);

const Segments = mongoose.model('segments', SegmentSchema);

export default Segments;
