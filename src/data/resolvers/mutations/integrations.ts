import { Integrations } from '../../../db/models';
import { IIntegration, IMessengerData, IUiOptions } from '../../../db/models/definitions/integrations';
import { IMessengerIntegration } from '../../../db/models/Integrations';
import { socUtils } from '../../../trackers/twitterTracker';
import { requireAdmin, requireLogin } from '../../permissions';
import { getAccessToken } from '../../../trackers/googleTracker';
import { getUserProfile, sendGmail } from '../../../trackers/gmail';

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
    { name, brandId, appId, pageIds }: { name: string; brandId: string; appId: string; pageIds: string[] },
  ) {
    return Integrations.createFacebookIntegration({
      name,
      brandId,
      facebookData: {
        appId,
        pageIds,
      },
    });
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
  async integrationsCreateGmailIntegration(_root, { code }) {
    const credentials = await getAccessToken(code);
    // get permission granted email address
    const userProfile: any = await getUserProfile(credentials);

    return Integrations.createGmailIntegration({
      name: userProfile.emailAddress,
      gmailData:{
        email: userProfile.emailAddress,
        credentials: credentials
      }
    });
  },

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
