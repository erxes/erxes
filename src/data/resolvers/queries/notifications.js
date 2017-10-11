import { MODULES } from '../../constants';

export default {
  /**
   * Module list used in notifications
   * @param {Object} args
   * @return {Promise} module list
   */
  notificationsModules() {
    return MODULES.ALL;
  },
};
