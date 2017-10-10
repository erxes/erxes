import { Configurations } from '../../../db/models';
import { MODULE_LIST } from '../../constants';

export default {
  configurationsGetModules() {
    return MODULE_LIST;
  },

  configurationsSaveConfig(doc) {
    return Configurations.saveConfig(doc);
  },
};
