import { Channels } from '../../../db/models';

export default {
  channels() {
    return Channels.find({});
  },
};
