import { Channels, Brands, Forms, Tags } from '../../db/models';

export default {
  brand(integration) {
    return Brands.findOne({ _id: integration.brandId });
  },

  form(integration) {
    return Forms.findOne({ _id: integration.formId });
  },

  channels(integration) {
    return Channels.find({ integrationIds: { $in: [integration._id] } });
  },
  tags(integration) {
    return Tags.find({ _id: { $in: integration.tagIds || [] } });
  },
};
