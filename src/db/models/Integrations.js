import mongoose from 'mongoose';
import Random from 'meteor-random';

const IntegrationSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  kind: String,
  name: String,
  brandId: String,
  formId: String,
  formData: Object,
  messengerData: Object,
  twitterData: Object,
  facebookData: Object,
  uiOptions: Object,
});

const Integrations = mongoose.model('integrations', IntegrationSchema);

export default Integrations;
