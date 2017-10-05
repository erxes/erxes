import mongoose from 'mongoose';
import Random from 'meteor-random';

const EmailTemplateSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  name: String,
  content: String,
});

const EmailTemplates = mongoose.model('email_templates', EmailTemplateSchema);

export default EmailTemplates;
