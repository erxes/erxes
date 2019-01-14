import { Accounts } from '../../../db/models';
import { utils } from '../../../trackers/gmailTracker';
import { getAccessToken } from '../../../trackers/googleTracker';
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

  /**
   * link Gmail account
   */
  async accountsAddGmail(_root, { code }: { code: string }) {
    const credentials: any = await getAccessToken(code, 'gmail');
    // get email address connected with
    const { data } = await utils.getGmailUserProfile(credentials);
    const email = data.emailAddress || '';

    return Accounts.createAccount({
      name: email,
      uid: email,
      kind: 'gmail',
      token: credentials.access_token,
      tokenSecret: credentials.refresh_token,
      expireDate: credentials.expiry_date,
      scope: credentials.scope,
    });
  },
};

moduleRequireLogin(accountMutations);

export default accountMutations;
