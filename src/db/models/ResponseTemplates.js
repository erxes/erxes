import mongoose from 'mongoose';
import Random from 'meteor-random';

const ResponseTemplateSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  name: String,
  content: String,
  brandId: String,
  files: {
    type: Array,
  },
});

const ResponseTemplates = mongoose.model('response_templates', ResponseTemplateSchema);

export default ResponseTemplates;
