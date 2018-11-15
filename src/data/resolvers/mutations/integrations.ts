import { sendPostRequest } from '../../../db/connection';
import { Integrations } from '../../../db/models';
import { IIntegration, IMessengerData, IUiOptions } from '../../../db/models/definitions/integrations';
import { IMessengerIntegration } from '../../../db/models/Integrations';
import { getGmailUserProfile, sendGmail } from '../../../trackers/gmail';
import { getAccessToken } from '../../../trackers/googleTracker';
import { socUtils } from '../../../trackers/twitterTracker';
import { requireAdmin, requireLogin } from '../../permissions';

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
  async integrationsCreateTwitterIntegration(_root, { queryParams, brandId }: { queryParams: any; brandId: string }) {
    const data: any = await socUtils.authenticate(queryParams);

    const integration = await Integrations.createTwitterIntegration({
      name: data.info.name,
      brandId,
      twitterData: {
        info: data.info,
        token: data.tokens.auth.token,
        tokenSecret: data.tokens.auth.token_secret,
      },
    });

    // start tracking new twitter entries
    socUtils.trackIntegration(integration);

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

    const { INTEGRATION_ENDPOINT_URL, FACEBOOK_APP_ID, DOMAIN } = process.env;

    if (INTEGRATION_ENDPOINT_URL) {
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
  async integrationsCreateGmailIntegration(_root, { code, brandId }: { code: string; brandId: string }) {
    const credentials = await getAccessToken(code, 'gmail');

    // get permission granted email address
    const data = await getGmailUserProfile(credentials);

    if (!data.emailAddress || !data.historyId) {
      throw new Error('Gmail profile not found');
    }

    return Integrations.createGmailIntegration({
      name: data.emailAddress,
      brandId,
      gmailData: {
        email: data.emailAddress,
        historyId: data.historyId,
        credentials,
      },
    });
  },

  /**
   * Send mail by gmail api
   */
  integrationsSendGmail(_root, args, { user }) {
    return sendGmail(args, user._id);
  },
};

requireLogin(integrationMutations, 'integrationsCreateMessengerIntegration');
requireLogin(integrationMutations, 'integrationsEditMessengerIntegration');
requireLogin(integrationMutations, 'integrationsSaveMessengerAppearanceData');
requireLogin(integrationMutations, 'integrationsSaveMessengerConfigs');
requireLogin(integrationMutations, 'integrationsCreateFormIntegration');
requireLogin(integrationMutations, 'integrationsEditFormIntegration');
requireLogin(integrationMutations, 'integrationsCreateTwitterIntegration');
requireLogin(integrationMutations, 'integrationsCreateFacebookIntegration');
requireLogin(integrationMutations, 'integrationsCreateGmailIntegration');
requireLogin(integrationMutations, 'integrationsSendGmail');
requireAdmin(integrationMutations, 'integrationsRemove');

export default integrationMutations;
