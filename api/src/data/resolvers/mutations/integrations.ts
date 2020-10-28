import * as telemetry from 'erxes-telemetry';

import { getUniqueValue } from '../../../db/factories';
import {
  Channels,
  Customers,
  EmailDeliveries,
  Integrations
} from '../../../db/models';
import { KIND_CHOICES } from '../../../db/models/definitions/constants';
import {
  IIntegration,
  IMessengerData,
  IUiOptions
} from '../../../db/models/definitions/integrations';
import { IExternalIntegrationParams } from '../../../db/models/Integrations';
import { debugExternalApi } from '../../../debuggers';
import messageBroker from '../../../messageBroker';
import { MODULE_NAMES, RABBITMQ_QUEUES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { registerOnboardHistory, replaceEditorAttributes } from '../../utils';

interface IEditIntegration extends IIntegration {
  _id: string;
}

interface IArchiveParams {
  _id: string;
  status: boolean;
}

interface ISmsParams {
  integrationId: string;
  content: string;
  to: string;
}

const integrationMutations = {
  /**
   * Creates a new messenger integration
   */
  async integrationsCreateMessengerIntegration(
    _root,
    doc: IIntegration,
    { user }: IContext
  ) {
    const integration = await Integrations.createMessengerIntegration(
      doc,
      user._id
    );

    if (doc.channelIds) {
      await Channels.updateMany(
        { _id: { $in: doc.channelIds } },
        { $push: { integrationIds: integration._id } }
      );
    }

    await putCreateLog(
      {
        type: MODULE_NAMES.INTEGRATION,
        newData: { ...doc, createdUserId: user._id, isActive: true },
        object: integration
      },
      user
    );

    telemetry.trackCli('integration_created', { type: 'messenger' });

    await registerOnboardHistory({ type: 'messengerIntegrationCreate', user });

    return integration;
  },

  /**
   * Updates a messenger integration
   */
  async integrationsEditMessengerIntegration(
    _root,
    { _id, ...fields }: IEditIntegration,
    { user }: IContext
  ) {
    const integration = await Integrations.getIntegration(_id);
    const updated = await Integrations.updateMessengerIntegration(_id, fields);

    await Channels.updateMany(
      { integrationIds: integration._id },
      { $pull: { integrationIds: integration._id } }
    );

    if (fields.channelIds) {
      await Channels.updateMany(
        { _id: { $in: fields.channelIds } },
        { $push: { integrationIds: integration._id } }
      );
    }

    await putUpdateLog(
      {
        type: MODULE_NAMES.INTEGRATION,
        object: integration,
        newData: fields,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Update/save messenger appearance data
   */
  integrationsSaveMessengerAppearanceData(
    _root,
    { _id, uiOptions }: { _id: string; uiOptions: IUiOptions }
  ) {
    return Integrations.saveMessengerAppearanceData(_id, uiOptions);
  },

  /**
   * Update/save messenger data
   */
  integrationsSaveMessengerConfigs(
    _root,
    { _id, messengerData }: { _id: string; messengerData: IMessengerData }
  ) {
    return Integrations.saveMessengerConfigs(_id, messengerData);
  },

  /**
   * Create a new messenger integration
   */
  async integrationsCreateLeadIntegration(
    _root,
    doc: IIntegration,
    { user }: IContext
  ) {
    const integration = await Integrations.createLeadIntegration(doc, user._id);

    await putCreateLog(
      {
        type: MODULE_NAMES.INTEGRATION,
        newData: { ...doc, createdUserId: user._id, isActive: true },
        object: integration
      },
      user
    );

    telemetry.trackCli('integration_created', { type: 'lead' });

    await registerOnboardHistory({ type: 'leadIntegrationCreate', user });

    return integration;
  },

  /**
   * Edit a lead integration
   */
  integrationsEditLeadIntegration(_root, { _id, ...doc }: IEditIntegration) {
    return Integrations.updateLeadIntegration(_id, doc);
  },

  /**
   * Create external integrations like twitter, facebook, gmail etc ...
   */
  async integrationsCreateExternalIntegration(
    _root,
    { data, ...doc }: IExternalIntegrationParams & { data: object },
    { user, dataSources }: IContext
  ) {
    const modifiedDoc: any = { ...doc };

    if (modifiedDoc.kind === KIND_CHOICES.WEBHOOK) {
      modifiedDoc.webhookData = { ...data };
      modifiedDoc.webhookData.token = await getUniqueValue(
        Integrations,
        'token'
      );
    }

    const integration = await Integrations.createExternalIntegration(
      modifiedDoc,
      user._id
    );

    if (doc.channelIds) {
      await Channels.updateMany(
        { _id: { $in: doc.channelIds } },
        { $push: { integrationIds: integration._id } }
      );
    }

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

    if (kind.includes('smooch')) {
      kind = 'smooch';
    }

    try {
      if (KIND_CHOICES.WEBHOOK !== kind) {
        await dataSources.IntegrationsAPI.createIntegration(kind, {
          accountId: doc.accountId,
          kind: doc.kind,
          integrationId: integration._id,
          data: data ? JSON.stringify(data) : ''
        });
      }

      telemetry.trackCli('integration_created', { type: doc.kind });

      await putCreateLog(
        {
          type: MODULE_NAMES.INTEGRATION,
          newData: { ...doc, createdUserId: user._id, isActive: true },
          object: integration
        },
        user
      );
    } catch (e) {
      await Integrations.remove({ _id: integration._id });
      throw new Error(e);
    }

    return integration;
  },

  async integrationsEditCommonFields(
    _root,
    { _id, name, brandId, channelIds, data },
    { user }
  ) {
    const integration = await Integrations.getIntegration(_id);

    const doc: any = { name, brandId, data };

    switch (integration.kind) {
      case KIND_CHOICES.WEBHOOK: {
        doc.webhookData = data;

        break;
      }
    }

    await Integrations.update({ _id }, { $set: doc });
    const updated = await Integrations.getIntegration(_id);

    await Channels.updateMany(
      { integrationIds: integration._id },
      { $pull: { integrationIds: integration._id } }
    );

    if (channelIds) {
      await Channels.updateMany(
        { _id: { $in: channelIds } },
        { $push: { integrationIds: integration._id } }
      );
    }

    await putUpdateLog(
      {
        type: MODULE_NAMES.INTEGRATION,
        object: { name: integration.name, brandId: integration.brandId },
        newData: { name, brandId },
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Deletes an integration
   */
  async integrationsRemove(
    _root,
    { _id }: { _id: string },
    { user, dataSources }: IContext
  ) {
    const integration = await Integrations.getIntegration(_id);

    try {
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
          'nylas-exchange',
          'nylas-yahoo',
          'chatfuel',
          'twitter-dm',
          'smooch-viber',
          'smooch-telegram',
          'smooch-line',
          'smooch-twilio',
          'whatsapp',
          'telnyx'
        ].includes(integration.kind)
      ) {
        await dataSources.IntegrationsAPI.removeIntegration({
          integrationId: _id
        });
      }

      await putDeleteLog(
        { type: MODULE_NAMES.INTEGRATION, object: integration },
        user
      );

      return Integrations.removeIntegration(_id);
    } catch (e) {
      debugExternalApi(e);
      throw e;
    }
  },

  /**
   * Delete an account
   */
  async integrationsRemoveAccount(_root, { _id }: { _id: string }) {
    try {
      const { erxesApiIds } = await messageBroker().sendRPCMessage(
        RABBITMQ_QUEUES.RPC_API_TO_INTEGRATIONS,
        {
          action: 'remove-account',
          data: { _id }
        }
      );

      for (const id of erxesApiIds) {
        await Integrations.removeIntegration(id);
      }

      return 'success';
    } catch (e) {
      debugExternalApi(e);
      throw e;
    }
  },

  /**
   * Send mail
   */
  async integrationSendMail(_root, args: any, { dataSources, user }: IContext) {
    const { erxesApiId, body, customerId, ...doc } = args;

    let kind = doc.kind;

    if (kind.includes('nylas')) {
      kind = 'nylas';
    }

    const customer = customerId
      ? await Customers.findOne({ _id: customerId })
      : undefined;
    const { replacedContent } = await replaceEditorAttributes({
      content: body,
      user,
      customer: customer || undefined
    });

    doc.body = replacedContent || '';

    try {
      await dataSources.IntegrationsAPI.sendEmail(kind, {
        erxesApiId,
        data: JSON.stringify(doc)
      });
    } catch (e) {
      debugExternalApi(e);
      throw e;
    }

    const customerIds = await Customers.find({
      primaryEmail: { $in: doc.to }
    }).distinct('_id');

    doc.userId = user._id;

    for (const cusId of customerIds) {
      await EmailDeliveries.createEmailDelivery({ ...doc, cusId });
    }

    return;
  },

  async integrationsArchive(
    _root,
    { _id, status }: IArchiveParams,
    { user }: IContext
  ) {
    const integration = await Integrations.getIntegration(_id);

    const updated = await Integrations.updateOne(
      { _id },
      { $set: { isActive: !status } }
    );

    await putUpdateLog(
      {
        type: MODULE_NAMES.INTEGRATION,
        object: integration,
        newData: { isActive: !status },
        description: `"${integration.name}" has been ${
          status === true ? 'archived' : 'unarchived'
        }.`,
        updatedDocument: updated
      },
      user
    );

    return Integrations.findOne({ _id });
  },

  async integrationsUpdateConfigs(
    _root,
    { configsMap },
    { dataSources }: IContext
  ) {
    return dataSources.IntegrationsAPI.updateConfigs(configsMap);
  },

  async integrationsSendSms(
    _root,
    args: ISmsParams,
    { dataSources }: IContext
  ) {
    return dataSources.IntegrationsAPI.sendSms(args);
  }
};

checkPermission(
  integrationMutations,
  'integrationsCreateMessengerIntegration',
  'integrationsCreateMessengerIntegration'
);
checkPermission(
  integrationMutations,
  'integrationsSaveMessengerAppearanceData',
  'integrationsSaveMessengerAppearanceData'
);
checkPermission(
  integrationMutations,
  'integrationsSaveMessengerConfigs',
  'integrationsSaveMessengerConfigs'
);
checkPermission(
  integrationMutations,
  'integrationsCreateLeadIntegration',
  'integrationsCreateLeadIntegration'
);
checkPermission(
  integrationMutations,
  'integrationsEditLeadIntegration',
  'integrationsEditLeadIntegration'
);
checkPermission(
  integrationMutations,
  'integrationsRemove',
  'integrationsRemove'
);
checkPermission(
  integrationMutations,
  'integrationsArchive',
  'integrationsArchive'
);
checkPermission(
  integrationMutations,
  'integrationsEditCommonFields',
  'integrationsEdit'
);
checkPermission(
  integrationMutations,
  'integrationsUpdateConfigs',
  'integrationsEdit'
);

export default integrationMutations;
