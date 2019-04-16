import { Accounts } from '../../../db/models';
import { checkPermission } from '../../permissions';

const accountQueries = {
  /**
   * Get linked social accounts
   */
  accounts(_root, args: { kind?: string }) {
    return Accounts.find(args);
  },
};

checkPermission(accountQueries, 'accounts', 'showAccounts', []);

export default accountQueries;
