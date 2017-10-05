import mongoose from 'mongoose';
import Random from 'meteor-random';

const TagSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  name: String,
  type: String,
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
  static createTag(tagObj) {
    return this.create({
      ...tagObj,
      createdAt: new Date(),
    });
  }
}

TagSchema.loadClass(Tag);
const Tags = mongoose.model('tags', TagSchema);

export default Tags;
