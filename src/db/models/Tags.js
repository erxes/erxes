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
  color: String,
  createdAt: Date,
  objectCount: Number,
});

const Tags = mongoose.model('tags', TagSchema);

export default Tags;
