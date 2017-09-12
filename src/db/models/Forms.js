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

export const Forms = mongoose.model('forms', FormSchema);

const FieldSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  formId: String,
  type: String,
  validation: String,
  text: String,
  description: String,
  options: [String],
  isRequired: Boolean,
  order: Number,
});

export const FormFields = mongoose.model('form_fields', FieldSchema);
