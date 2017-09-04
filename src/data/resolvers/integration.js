import { Channels, Brands } from '../../db/models';

export default {
  brand(integration) {
    return Brands.findOne({ _id: integration.brandId });
  },

  channels(integration) {
    return Channels.find({ integrationIds: { $in: [integration._id] } });
  },
};
