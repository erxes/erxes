import { Accounts } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const accountMutations = {
  /**
   * Remove a history
   */
  accountsRemove(_root, { _id }: { _id: string }) {
    return Accounts.removeAccount(_id);
  },
};

moduleRequireLogin(accountMutations);

export default accountMutations;
