import { Accounts, Integrations } from '../../../db/models';
import { IIntegration, IMessengerData, IUiOptions } from '../../../db/models/definitions/integrations';
import { IUserDocument } from '../../../db/models/definitions/users';
import { IMessengerIntegration } from '../../../db/models/Integrations';
import { sendGmail, updateHistoryId } from '../../../trackers/gmail';
import { socUtils } from '../../../trackers/twitterTracker';
import { checkPermission } from '../../permissions';
import { getEnv, sendPostRequest } from '../../utils';

interface IEditMessengerIntegration extends IMessengerIntegration {
  _id: string;
}

interface IEditFormIntegration extends IIntegration {
  _id: string;
}

const integrationMutations = {
  /**
   * Create a new messenger integration
   */
  integrationsCreateMessengerIntegration(_root, doc: IMessengerIntegration) {
    return Integrations.createMessengerIntegration(doc);
  },

  /**
   * Update messenger integration
   */
  integrationsEditMessengerIntegration(_root, { _id, ...fields }: IEditMessengerIntegration) {
    return Integrations.updateMessengerIntegration(_id, fields);
  },

  /**
   * Update/save messenger appearance data
   */
  integrationsSaveMessengerAppearanceData(_root, { _id, uiOptions }: { _id: string; uiOptions: IUiOptions }) {
    return Integrations.saveMessengerAppearanceData(_id, uiOptions);
  },

  /**
   * Update/save messenger data
   */
  integrationsSaveMessengerConfigs(_root, { _id, messengerData }: { _id: string; messengerData: IMessengerData }) {
    return Integrations.saveMessengerConfigs(_id, messengerData);
  },

  /**
   * Create a new messenger integration
   */
  integrationsCreateFormIntegration(_root, doc: IIntegration) {
    return Integrations.createFormIntegration(doc);
  },

  /**
   * Create a new twitter integration
   */
  async integrationsCreateTwitterIntegration(_root, { accountId, brandId }: { accountId: string; brandId: string }) {
    const account = await Accounts.findOne({ _id: accountId });

    if (!account) {
      throw new Error('Account not found');
    }

    const integration = await Integrations.createTwitterIntegration({
      name: account.name,
      brandId,
      twitterData: {
        profileId: account.uid,
        accountId: account._id,
      },
    });

    // start tracking new twitter entries
    socUtils.trackIntegration(account, integration);

    return integration;
  },

  /**
   * Create a new facebook integration
   */
  async integrationsCreateFacebookIntegration(
    _root,
    { name, brandId, pageIds, accountId }: { name: string; brandId: string; pageIds: string[]; accountId: string },
  ) {
    const integration = Integrations.createFacebookIntegration({
      name,
      brandId,
      facebookData: {
        accountId,
        pageIds,
      },
    });

    const INTEGRATION_ENDPOINT_URL = getEnv({ name: 'INTEGRATION_ENDPOINT_URL', defaultValue: '' });
    const FACEBOOK_APP_ID = getEnv({ name: 'FACEBOOK_APP_ID' });
    const DOMAIN = getEnv({ name: 'DOMAIN' });

    if (INTEGRATION_ENDPOINT_URL !== '') {
      for (const pageId of pageIds) {
        await sendPostRequest(`${INTEGRATION_ENDPOINT_URL}/service/facebook/${FACEBOOK_APP_ID}/webhook-callback`, {
          endPoint: DOMAIN || '',
          pageId,
        });
      }
    }

    return integration;
  },

  /**
   * Edit a form integration
   */
  integrationsEditFormIntegration(_root, { _id, ...doc }: IEditFormIntegration) {
    return Integrations.updateFormIntegration(_id, doc);
  },

  /**
   * Delete an integration
   */
  integrationsRemove(_root, { _id }: { _id: string }) {
    return Integrations.removeIntegration(_id);
  },

  /**
   * Create gmail integration
   */
  async integrationsCreateGmailIntegration(
    _root,
    { name, accountId, brandId }: { name: string; accountId: string; brandId: string },
  ) {
    const account = await Accounts.findOne({ _id: accountId });

    if (!account) {
      throw new Error(`Account not found id with ${accountId}`);
    }

    const integration = await Integrations.createGmailIntegration({
      name,
      brandId,
      gmailData: {
        email: account.uid,
        accountId,
      },
    });

    await updateHistoryId(integration);

    return integration;
  },

  /**
   * Send mail by gmail api
   */
  integrationsSendGmail(_root, args, { user }: { user: IUserDocument }) {
    return sendGmail(args, user);
  },
};

checkPermission(
  integrationMutations,
  'integrationsCreateMessengerIntegration',
  'integrationsCreateMessengerIntegration',
);
checkPermission(
  integrationMutations,
  'integrationsSaveMessengerAppearanceData',
  'integrationsSaveMessengerAppearanceData',
);
checkPermission(integrationMutations, 'integrationsSaveMessengerConfigs', 'integrationsSaveMessengerConfigs');
checkPermission(integrationMutations, 'integrationsCreateFormIntegration', 'integrationsCreateFormIntegration');
checkPermission(integrationMutations, 'integrationsEditFormIntegration', 'integrationsEditFormIntegration');
checkPermission(integrationMutations, 'integrationsCreateTwitterIntegration', 'integrationsCreateTwitterIntegration');
checkPermission(integrationMutations, 'integrationsCreateFacebookIntegration', 'integrationsCreateFacebookIntegration');
checkPermission(integrationMutations, 'integrationsCreateGmailIntegration', 'integrationsCreateGmailIntegration');
checkPermission(integrationMutations, 'integrationsSendGmail', 'integrationsSendGmail');
checkPermission(integrationMutations, 'integrationsRemove', 'integrationsRemove');

export default integrationMutations;
