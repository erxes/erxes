import { Customers, EmailDeliveries, Integrations } from '../../../db/models';
import { IIntegration, IMessengerData, IUiOptions } from '../../../db/models/definitions/integrations';
import { IExternalIntegrationParams } from '../../../db/models/Integrations';
import { debugExternalApi } from '../../../debuggers';
import { sendRPCMessage } from '../../../messageBroker';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IEditIntegration extends IIntegration {
  _id: string;
}

const integrationMutations = {
  /**
   * Creates a new messenger integration
   */
  async integrationsCreateMessengerIntegration(_root, doc: IIntegration, { user }: IContext) {
    const integration = await Integrations.createMessengerIntegration(doc, user._id);

    await putCreateLog(
      {
        type: MODULE_NAMES.INTEGRATION,
        newData: { ...doc, createdUserId: user._id, isActive: true },
        object: integration,
      },
      user,
    );

    return integration;
  },

  /**
   * Updates a messenger integration
   */
  async integrationsEditMessengerIntegration(_root, { _id, ...fields }: IEditIntegration, { user }: IContext) {
    const integration = await Integrations.getIntegration(_id);
    const updated = await Integrations.updateMessengerIntegration(_id, fields);

    await putUpdateLog(
      {
        type: MODULE_NAMES.INTEGRATION,
        object: integration,
        newData: fields,
        updatedDocument: updated,
      },
      user,
    );

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
        type: MODULE_NAMES.INTEGRATION,
        newData: { ...doc, createdUserId: user._id, isActive: true },
        object: integration,
      },
      user,
    );

    return integration;
  },

  /**
   * Edit a lead integration
   */
  integrationsEditLeadIntegration(_root, { _id, ...doc }: IEditIntegration) {
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

    if (kind === 'twitter-dm') {
      kind = 'twitter';
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
          type: MODULE_NAMES.INTEGRATION,
          newData: { ...doc, createdUserId: user._id, isActive: true },
          object: integration,
        },
        user,
      );
    } catch (e) {
      await Integrations.remove({ _id: integration._id });
      throw new Error(e);
    }

    return integration;
  },

  async integrationsEditCommonFields(_root, { _id, name, brandId }, { user }) {
    const integration = await Integrations.getIntegration(_id);
    const updated = Integrations.updateBasicInfo(_id, { name, brandId });

    await putUpdateLog(
      {
        type: MODULE_NAMES.INTEGRATION,
        object: { name: integration.name, brandId: integration.brandId },
        newData: { name, brandId },
        updatedDocument: updated,
      },
      user,
    );

    return updated;
  },

  /**
   * Create IMAP account
   */
  integrationAddImapAccount(_root, data, { dataSources }) {
    return dataSources.IntegrationsAPI.createAccount(data);
  },

  /**
   * Create Yahoo, Outlook account
   */
  integrationAddMailAccount(_root, data, { dataSources }) {
    return dataSources.IntegrationsAPI.createAccount(data);
  },

  /**
   * Deletes an integration
   */
  async integrationsRemove(_root, { _id }: { _id: string }, { user, dataSources }: IContext) {
    const integration = await Integrations.getIntegration(_id);

    if (
      [
        'facebook-messenger',
        'facebook-post',
        'gmail',
        'callpro',
        'nylas-gmail',
        'nylas-imap',
        'nylas-office365',
        'nylas-outlook',
        'nylas-yahoo',
        'chatfuel',
        'twitter-dm',
      ].includes(integration.kind)
    ) {
      await dataSources.IntegrationsAPI.removeIntegration({ integrationId: _id });
    }

    await putDeleteLog({ type: MODULE_NAMES.INTEGRATION, object: integration }, user);

    return Integrations.removeIntegration(_id);
  },

  /**
   * Delete an account
   */
  async integrationsRemoveAccount(_root, { _id }: { _id: string }) {
    const { erxesApiIds } = await sendRPCMessage({ action: 'remove-account', data: { _id } });

    for (const id of erxesApiIds) {
      await Integrations.removeIntegration(id);
    }

    return 'success';
  },

  /**
   * Send mail
   */
  async integrationSendMail(_root, args: any, { dataSources, user }: IContext) {
    const { erxesApiId, ...doc } = args;

    let kind = doc.kind;

    if (kind.includes('nylas')) {
      kind = 'nylas';
    }

    try {
      await dataSources.IntegrationsAPI.sendEmail(kind, {
        erxesApiId,
        data: JSON.stringify(doc),
      });
    } catch (e) {
      debugExternalApi(e);
      throw new Error(e);
    }

    const customerIds = await Customers.find({ primaryEmail: { $in: doc.to } }).distinct('_id');

    doc.userId = user._id;

    for (const customerId of customerIds) {
      await EmailDeliveries.createEmailDelivery({ ...doc, customerId });
    }

    return;
  },

  async integrationsArchive(_root, { _id }: { _id: string }, { user }: IContext) {
    const integration = await Integrations.getIntegration(_id);

    const updated = await Integrations.updateOne({ _id }, { $set: { isActive: false } });

    await putUpdateLog(
      {
        type: MODULE_NAMES.INTEGRATION,
        object: integration,
        newData: { isActive: false },
        description: `"${integration.name}" has been archived.`,
        updatedDocument: updated,
      },
      user,
    );

    return Integrations.findOne({ _id });
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
checkPermission(integrationMutations, 'integrationsArchive', 'integrationsArchive');
checkPermission(integrationMutations, 'integrationsEditCommonFields', 'integrationsEdit');

export default integrationMutations;
