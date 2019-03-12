import { Accounts } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const accountQueries = {
  /**
   * Get linked social accounts
   */
  accounts(_root, args: { kind?: string }) {
    return Accounts.find(args);
  },
};

moduleRequireLogin(accountQueries);

export default accountQueries;
