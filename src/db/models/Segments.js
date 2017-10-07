import mongoose from 'mongoose';
import Random from 'meteor-random';

const ConditionSchema = mongoose.Schema(
  {
    field: String,
    operator: String,
    type: String,

    value: {
      type: String,
      optional: true,
    },

    dateUnit: {
      type: String,
      optional: true,
    },
  },
  { _id: false },
);

const SegmentSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  name: String,
  description: String,
  subOf: String,
  color: String,
  connector: String,
  conditions: [ConditionSchema],
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
