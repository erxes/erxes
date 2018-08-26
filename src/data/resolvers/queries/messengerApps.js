import { MessengerApps } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const messengerAppQueries = {
  /*
   * MessengerApps list
   */
  messengerApps() {
    return MessengerApps.find({});
  },
};

moduleRequireLogin(messengerAppQueries);

export default messengerAppQueries;
