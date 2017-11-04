import { MODULES } from '../../constants';

import { moduleRequireLogin } from '../../permissions';

const notificationQueries = {
  /**
   * Module list used in notifications
   * @param {Object} args
   * @return {String[]} returns module list
   */
  notificationsModules() {
    return MODULES.ALL;
  },
};

moduleRequireLogin(notificationQueries);

export default notificationQueries;
