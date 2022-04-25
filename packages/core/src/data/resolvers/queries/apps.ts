import Apps from '../../../db/models/Apps';

export default {
  apps() {
    return Apps.find().lean();
  },
  appTotalCount() {
    return Apps.countDocuments();
  }
}
