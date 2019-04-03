import { Accounts } from '../../../db/models';
import { utils } from '../../../trackers/gmailTracker';
import { moduleRequireLogin } from '../../permissions';

const accountMutations = {
  /**
   * Remove a history
   */
  async accountsRemove(_root, { _id }: { _id: string }) {
    const account = await Accounts.findOne({ _id });

    if (!account) {
      throw new Error(`Account not found id with ${_id}`);
    }

    if (account.kind === 'gmail') {
      const credentials = await Accounts.getGmailCredentials(account.uid);
      // remove email from google push notification
      await utils.stopReceivingEmail(account.uid, credentials);
    }

    return Accounts.removeAccount(_id);
  },
};

moduleRequireLogin(accountMutations);

export default accountMutations;
