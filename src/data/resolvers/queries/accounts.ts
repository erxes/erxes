import { Accounts } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const accountQueries = {
  /**
   * Get linked social accounts
   */

  async accounts(_root, {}) {
    return Accounts.find({});
  },
};

moduleRequireLogin(accountQueries);

export default accountQueries;
