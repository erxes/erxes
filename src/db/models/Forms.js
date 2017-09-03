import mongoose from 'mongoose';
import Random from 'meteor-random';

const FormSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  title: String,
  code: String,
  description: String,
  createdUserId: String,
  createdDate: Date,
});

const Forms = mongoose.model('forms', FormSchema);

export default Forms;
