import mongoose from 'mongoose';
import Random from 'meteor-random';
import { TAG_TYPES } from '../../data/constants';

const TagSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  name: String,
  type: {
    type: String,
    enum: TAG_TYPES.ALL_LIST,
  },
  colorCode: String,
  createdAt: Date,
  objectCount: Number,
});

class Tag {
  /**
   * Create a tag
   * @param  {Object} tagObj object
   * @return {Promise} Newly created tag object
   */
  static createTag(doc) {
    return this.create({
      ...doc,
      createdAt: new Date(),
    });
  }
}

TagSchema.loadClass(Tag);
const Tags = mongoose.model('tags', TagSchema);

export default Tags;
