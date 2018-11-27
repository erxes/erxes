import { Accounts } from '../../../db/models';
import { socUtils } from '../../../trackers/twitterTracker';
import { moduleRequireLogin } from '../../permissions';

interface ITwitterAuthParams {
  oauth_token: string;
  oauth_verifier: string;
}

interface IAuthenticateResponse {
  tokens: {
    auth: {
      token: string;
      token_secret: string;
    };
  };
  info?: {
    name?: string;
    id?: string;
  };
}

const accountMutations = {
  /**
   * Remove a history
   */
  accountsRemove(_root, { _id }: { _id: string }) {
    return Accounts.removeAccount(_id);
  },

  /**
   * link twitter account
   */
  async accountsAddTwitter(_root, { queryParams }: { queryParams: ITwitterAuthParams }) {
    const data: IAuthenticateResponse = await socUtils.authenticate(queryParams);

    return Accounts.create({
      kind: 'twitter',
      token: data.tokens.auth.token,
      tokenSecret: data.tokens.auth.token_secret,
      name: data.info && data.info.name,
      uid: data.info && data.info.id,
    });
  },
};

moduleRequireLogin(accountMutations);

export default accountMutations;
