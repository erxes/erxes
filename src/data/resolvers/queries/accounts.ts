import { Accounts } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const accountQueries = {
  /**
   * Get linked social accounts
   */

  async accounts(_root, { kind }: { kind?: string }) {
    return Accounts.find({ kind });
  },
};

moduleRequireLogin(accountQueries);

export default accountQueries;
