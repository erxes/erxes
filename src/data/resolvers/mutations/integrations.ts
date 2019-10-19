import { Integrations } from '../../../db/models';
import { IIntegration, IMessengerData, IUiOptions } from '../../../db/models/definitions/integrations';
import { IExternalIntegrationParams, IMessengerIntegration } from '../../../db/models/Integrations';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';

interface IEditMessengerIntegration extends IMessengerIntegration {
  _id: string;
}

interface IEditLeadIntegration extends IIntegration {
  _id: string;
}

const integrationMutations = {
  /**
   * Create a new messenger integration
   */
  async integrationsCreateMessengerIntegration(_root, doc: IMessengerIntegration, { user }: IContext) {
    const integration = await Integrations.createMessengerIntegration(doc, user._id);

    await putCreateLog(
      {
        type: 'messengerIntegration',
        newData: JSON.stringify(doc),
        object: integration,
        description: `${integration.name} has been created`,
      },
      user,
    );

    return integration;
  },

  /**
   * Update messenger integration
   */
  async integrationsEditMessengerIntegration(_root, { _id, ...fields }: IEditMessengerIntegration, { user }: IContext) {
    const integration = await Integrations.findOne({ _id });
    const updated = await Integrations.updateMessengerIntegration(_id, fields);

    if (integration) {
      await putUpdateLog(
        {
          type: 'integration',
          object: integration,
          newData: JSON.stringify(fields),
          description: `${integration.name} has been edited`,
        },
        user,
      );
    }

    return updated;
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
  async integrationsCreateLeadIntegration(_root, doc: IIntegration, { user }: IContext) {
    const integration = await Integrations.createLeadIntegration(doc, user._id);

    await putCreateLog(
      {
        type: 'leadIntegration',
        newData: JSON.stringify(doc),
        object: integration,
        description: `${integration.name} has been created`,
      },
      user,
    );

    return integration;
  },

  /**
   * Edit a lead integration
   */
  integrationsEditLeadIntegration(_root, { _id, ...doc }: IEditLeadIntegration) {
    return Integrations.updateLeadIntegration(_id, doc);
  },

  /*
   * Create external integrations like twitter, facebook, gmail etc ...
   */
  async integrationsCreateExternalIntegration(
    _root,
    { data, ...doc }: IExternalIntegrationParams & { data: object },
    { user, dataSources }: IContext,
  ) {
    const integration = await Integrations.createExternalIntegration(doc, user._id);

    let kind = doc.kind;

    if (kind.includes('nylas')) {
      kind = 'nylas';
    }

    if (kind.includes('facebook')) {
      kind = 'facebook';
    }

    try {
      await dataSources.IntegrationsAPI.createIntegration(kind, {
        accountId: doc.accountId,
        kind: doc.kind,
        integrationId: integration._id,
        data: data ? JSON.stringify(data) : '',
      });

      await putCreateLog(
        {
          type: `${kind}Integration`,
          newData: JSON.stringify(doc),
          object: integration,
          description: `${integration.name} has been created`,
        },
        user,
      );
    } catch (e) {
      await Integrations.remove({ _id: integration._id });
      throw new Error(e);
    }

    return integration;
  },

  /**
   * Create account
   */
  async integrationAddImapAccount(_root, data, { dataSources }) {
    return dataSources.IntegrationsAPI.createImapAccount(data);
  },

  /**
   * Delete an integration
   */
  async integrationsRemove(_root, { _id }: { _id: string }, { user, dataSources }: IContext) {
    const integration = await Integrations.findOne({ _id });

    if (integration) {
      if (
        ['facebook-messenger', 'facebook-post', 'gmail', 'callpro', 'nylas-gmail', 'nylas-imap', 'chatfuel'].includes(
          integration.kind || '',
        )
      ) {
        await dataSources.IntegrationsAPI.removeIntegration({ integrationId: _id });
      }

      await putDeleteLog(
        {
          type: 'integration',
          object: integration,
          description: `${integration.name} has been removed`,
        },
        user,
      );
    }

    return Integrations.removeIntegration(_id);
  },

  /**
   * Delete an account
   */
  async integrationsRemoveAccount(_root, { _id }: { _id: string }, { dataSources }: IContext) {
    return dataSources.IntegrationsAPI.removeAccount({ _id });
  },

  /**
   * Send mail
   */
  async integrationSendMail(_root, args: any, { dataSources }: IContext) {
    const { erxesApiId, ...doc } = args;

    let kind = doc.kind;

    if (kind.includes('nylas')) {
      kind = 'nylas';
    }

    return dataSources.IntegrationsAPI.sendEmail(kind, {
      erxesApiId,
      data: JSON.stringify(doc),
    });
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
checkPermission(integrationMutations, 'integrationsCreateLeadIntegration', 'integrationsCreateLeadIntegration');
checkPermission(integrationMutations, 'integrationsEditLeadIntegration', 'integrationsEditLeadIntegration');
checkPermission(integrationMutations, 'integrationsRemove', 'integrationsRemove');

export default integrationMutations;
