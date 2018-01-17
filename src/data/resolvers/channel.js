import { Integrations } from '../../db/models';

export default {
  integrations(channel) {
    return Integrations.find({ _id: { $in: channel.integrationIds } });
  },
};
