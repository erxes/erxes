import { Accounts } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const accountQueries = {
  /**
   * Get linked social accounts
   */

  async accounts(_root, args: { kind?: string }) {
    const generateParams = params => {
      const selector: { [key: string]: string } = {};

      if (params.kind) {
        selector.kind = params.kind;
      }

      return selector;
    };

    return Accounts.find(generateParams(args));
  },
};

moduleRequireLogin(accountQueries);

export default accountQueries;
