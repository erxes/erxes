import { NotificationConfigurations } from '../../../db/models';
import { MODULE_LIST } from '../../constants';

export default {
  configurationsGetModules() {
    return MODULE_LIST;
  },

  configurationsSaveConfig(doc) {
    return NotificationConfigurations.saveConfig(doc);
  },
};
