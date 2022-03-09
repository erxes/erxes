import * as telemetry from 'erxes-telemetry';

import { getUniqueValue } from '@erxes/api-utils/src/core';
import { putActivityLog } from '@erxes/api-utils/src/logUtils';

import {
  EmailDeliveries,
  Fields,
  Forms
} from '../../apiCollections';

import {
  //   ACTIVITY_ACTIONS,
  //   ACTIVITY_CONTENT_TYPES,
  KIND_CHOICES
} from '../../models/definitions/constants';

import {
  IIntegration,
  IIntegrationDocument,
  IMessengerData,
  IUiOptions
} from '../../models/definitions/integrations';

// import { IUserDocument } from '../../../db/models/definitions/users';

import { IExternalIntegrationParams } from '../../models/Integrations';

import { debug } from '../../configs';
import messageBroker, { sendMessage, sendContactRPCMessage, sendRPCMessage } from '../../messageBroker';

import { MODULE_NAMES } from '../../constants';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog
} from '../../logUtils';

import { checkPermission } from '@erxes/api-utils/src/permissions';

// import EditorAttributeUtil from '@erxes/api-utils/src/editorAttributeUtils';
import { client as msgBrokerClient } from '../../messageBroker';
import { getService, getServices } from '../../redis';
import { IContext, IModels } from '../../connectionResolver';

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

const createIntegration = async (
  doc: IIntegration,
  integration: IIntegrationDocument,
  //   user: IUserDocument,
  user,
  type: string,
  models: IModels
) => {
  if (doc.channelIds) {
    await models.Channels.updateMany(
      { _id: { $in: doc.channelIds } },
      { $push: { integrationIds: integration._id } }
    );
  }

    await putCreateLog(
      models,
      {
        type: MODULE_NAMES.INTEGRATION,
        newData: { ...doc, createdUserId: user._id, isActive: true },
        object: integration
      },
      user
    );

  telemetry.trackCli('integration_created', { type });

  sendMessage('registerOnboardHistory', {
    type: `${type}IntegrationCreated`,
    user
  });

  return integration;
};

const editIntegration = async (
  fields: IIntegration,
  integration: IIntegrationDocument,
  //   user: IUserDocument,
  user,
  updated: IIntegrationDocument,
  models: IModels
) => {
  await models.Channels.updateMany(
    { integrationIds: integration._id },
    { $pull: { integrationIds: integration._id } }
  );

  if (fields.channelIds) {
    await models.Channels.updateMany(
      { _id: { $in: fields.channelIds } },
      { $push: { integrationIds: integration._id } }
    );
  }

    await putUpdateLog(
      models,
      {
        type: MODULE_NAMES.INTEGRATION,
        object: integration,
        newData: fields,
        updatedDocument: updated
      },
      user
    );

  return updated;
};

const integrationMutations = {
  /**
   * Creates a new messenger integration
   */
  async integrationsCreateMessengerIntegration(
    _root,
    doc: IIntegration,
    { user, models }: IContext
  ) {
    const integration = await models.Integrations.createMessengerIntegration(
      doc,
      user._id
    );

    return createIntegration(doc, integration, user, 'messenger', models);
  },

  /**
   * Updates a messenger integration
   */
  async integrationsEditMessengerIntegration(
    _root,
    { _id, ...fields }: IEditIntegration,
    { user, models }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });
    const updated = await models.Integrations.updateMessengerIntegration(_id, fields);

    return editIntegration(fields, integration, user, updated, models);
  },

  /**
   * Update/save messenger appearance data
   */
  async integrationsSaveMessengerAppearanceData(
    _root,
    { _id, uiOptions }: { _id: string; uiOptions: IUiOptions },
    { models }: IContext
  ) {
    return models.Integrations.saveMessengerAppearanceData(_id, uiOptions);
  },

  /**
   * Update/save messenger data
   */
  async integrationsSaveMessengerConfigs(
    _root,
    { _id, messengerData }: { _id: string; messengerData: IMessengerData },
    { models }: IContext
  ) {
    return models.Integrations.saveMessengerConfigs(_id, messengerData);
  },

  /**
   * Create a new messenger integration
   */
  async integrationsCreateLeadIntegration(
    _root,
    doc: IIntegration,
    { user, models }: IContext
  ) {
    const integration = await models.Integrations.createLeadIntegration(doc, user._id);

    return createIntegration(doc, integration, user, 'lead', models);
  },

  /**
   * Edit a lead integration
   */
  async integrationsEditLeadIntegration(
    _root,
    { _id, ...doc }: IEditIntegration,
    { user, models }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });

    const updated = await models.Integrations.updateLeadIntegration(_id, doc);

    return editIntegration(doc, integration, user, updated, models);
  },

  /**
   * Create external integrations like twitter, facebook, gmail etc ...
   */
  async integrationsCreateExternalIntegration(
    _root,
    { data, ...doc }: IExternalIntegrationParams & { data: object },
    { user, models }: IContext
  ) {
    const modifiedDoc: any = { ...doc };

    if (modifiedDoc.kind === KIND_CHOICES.WEBHOOK) {
      modifiedDoc.webhookData = { ...data };

      if (
        !modifiedDoc.webhookData.token ||
        modifiedDoc.webhookData.token === ''
      ) {
        modifiedDoc.webhookData.token = await getUniqueValue(
          models.Integrations,
          'token'
        );
      }
    }

    const integration = await models.Integrations.createExternalIntegration(
      modifiedDoc,
      user._id
    );

    if (doc.channelIds) {
      await models.Channels.updateMany(
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
        await sendRPCMessage('integrations:rpc_queue:createIntegration', {
          kind,
          doc: {
            accountId: doc.accountId,
            kind: doc.kind,
            integrationId: integration._id,
            data: data ? JSON.stringify(data) : ''
          }
        })
      }

      telemetry.trackCli('integration_created', { type: doc.kind });

      await putCreateLog(
        models,
        {
          type: MODULE_NAMES.INTEGRATION,
          newData: { ...doc, createdUserId: user._id, isActive: true },
          object: integration
        },
        user
      );
    } catch (e) {
      await models.Integrations.deleteOne({ _id: integration._id });
      throw new Error(e);
    }

    return integration;
  },

  async integrationsEditCommonFields(
    _root,
    { _id, name, brandId, channelIds, data },
    { user, models }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });

    const doc: any = { name, brandId, data };

    switch (integration.kind) {
      case KIND_CHOICES.WEBHOOK: {
        doc.webhookData = data;

        break;
      }
    }

    await models.Integrations.updateOne({ _id }, { $set: doc });

    const updated = await models.Integrations.getIntegration({ _id });

    await models.Channels.updateMany(
      { integrationIds: integration._id },
      { $pull: { integrationIds: integration._id } }
    );

    if (channelIds) {
      await models.Channels.updateMany(
        { _id: { $in: channelIds } },
        { $push: { integrationIds: integration._id } }
      );
    }

    await putUpdateLog(
      models,
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
    { user, models }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });

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
          'telnyx',
          'webhook'
        ].includes(integration.kind)
      ) {
        await sendRPCMessage('integrations:rcp_queue:removeIntegrations', {
          integrationid: _id
        })
      }

      await putDeleteLog(
        models,
        { type: MODULE_NAMES.INTEGRATION, object: integration },
        user
      );

      return models.Integrations.removeIntegration(_id);
    } catch (e) {
      debug.error(e);
      throw e;
    }
  },

  /**
   * Delete an account
   */
  async integrationsRemoveAccount(_root, { _id }: { _id: string }, { models }: IContext) {
    try {
      const { erxesApiIds } = await sendRPCMessage(
        'rpc_queue:api_to_integrations',
        {
          action: 'remove-account',
          data: { _id }
        }
      );

      for (const id of erxesApiIds) {
        await models.Integrations.removeIntegration(id);
      }

      return 'success';
    } catch (e) {
      debug.error(e);
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

    let customer;

    const selector = customerId
      ? { _id: customerId }
      : { status: { $ne: 'deleted' }, emails: { $in: doc.to } };

    customer = await sendContactRPCMessage('findCustomer', selector);

    if (!customer) {
      const [primaryEmail] = doc.to;

      customer = await sendContactRPCMessage('create_customer', {
        state: 'lead',
        primaryEmail
      });
    }

    const apiService = await getService('api');

    // const replacedContent = await new EditorAttributeUtil(
    //   msgBrokerClient,
    //   apiService.address,
    //   await getServices()
    // ).replaceAttributes({
    //   content: body,
    //   user,
    //   customer: customer || undefined
    // });

    // doc.body = replacedContent || '';

    try {
      await sendRPCMessage('integrations:rcp_queue:sendEmail', {
        kind,
        doc: {
          erxesApiId,
          data: JSON.stringify(doc)
        }
      })
    } catch (e) {
      debug.error(e);
      throw e;
    }

    const customerIds = await sendContactRPCMessage("getCustomerIds", {
      primaryEmail: { $in: doc.to }
    })

    doc.userId = user._id;

    for (const cusId of customerIds) {
      await EmailDeliveries.createEmailDelivery({ ...doc, customerId: cusId });
    }

    return;
  },

  async integrationsArchive(
    _root,
    { _id, status }: IArchiveParams,
    { user, models }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });

    await models.Integrations.updateOne({ _id }, { $set: { isActive: !status } });

    const updated = await models.Integrations.findOne({ _id });

    await putUpdateLog(
      models,
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

    return updated;
  },
  
  async integrationsSendSms(
    _root,
    args: ISmsParams,
    { user }: IContext
  ) {
    const customer = await sendContactRPCMessage('findCustomer', {
      primaryPhone: args.to
    });

    if (!customer) {
      throw new Error(`Customer not found with primary phone "${args.to}"`);
    }
    if (customer.phoneValidationStatus !== 'valid') {
      throw new Error(`Customer's primary phone ${args.to} is not valid`);
    }

    try {
      const response = await sendRPCMessage('integrations:rpc_queue:sendSms', args)

      if (response && response.status === 'ok') {
        await putActivityLog({
          messageBroker: messageBroker(),
          action: 'add',
          data: {
            action: 'send',
            contentType: 'sms',
            createdBy: user._id,
            contentId: customer._id,
            content: { to: args.to, text: args.content }
          }
        });
      }

      return response;
    } catch (e) {
      return e;
    }
  },

  async integrationsCopyLeadIntegration(
    _root,
    { _id }: { _id },
    { docModifier, user, models }: IContext
  ) {
    const sourceIntegration = await models.Integrations.getIntegration({ _id });

    if (!sourceIntegration.formId) {
      throw new Error('Integration kind is not form');
    }

    const sourceForm = await Forms.getForm(sourceIntegration.formId);

    const sourceFields = await Fields.find({ contentTypeId: sourceForm._id });

    const formDoc = docModifier({
      ...sourceForm.toObject(),
      title: `${sourceForm.title}-copied`
    });

    delete formDoc._id;
    delete formDoc.code;

    const copiedForm = await Forms.createForm(formDoc, user._id);

    const leadData = sourceIntegration.leadData;

    const doc = docModifier({
      ...sourceIntegration.toObject(),
      name: `${sourceIntegration.name}-copied`,
      formId: copiedForm._id,
      leadData: leadData && {
        ...leadData.toObject(),
        viewCount: 0,
        contactsGathered: 0
      }
    });

    delete doc._id;

    const copiedIntegration = await models.Integrations.createLeadIntegration(
      doc,
      user._id
    );

    const fields = sourceFields.map(e => ({
      options: e.options,
      isVisible: e.isVisible,
      contentType: e.contentType,
      contentTypeId: copiedForm._id,
      order: e.order,
      type: e.type,
      text: e.text,
      lastUpdatedUserId: user._id,
      isRequired: e.isRequired,
      isDefinedByErxes: false,
      associatedFieldId: e.associatedFieldId
    }));

    await Fields.insertMany(fields);

    await putCreateLog(
      models,
      {
        type: MODULE_NAMES.INTEGRATION,
        newData: { ...doc, createdUserId: user._id, isActive: true },
        object: copiedIntegration
      },
      user
    );

    telemetry.trackCli('integration_created', { type: 'lead' });

    sendMessage('registerOnboardHistory', {
      type: 'leadIntegrationCreate',
      user
    });

    return copiedIntegration;
  },
  /**
   * Create a new booking integration
   */
  async integrationsCreateBookingIntegration(
    _root,
    doc: IIntegration,
    { user, models }: IContext
  ) {
    const integration = await models.Integrations.createBookingIntegration(
      doc,
      user._id
    );

    return createIntegration(doc, integration, user, 'booking', models);
  },

  /**
   * Edit a boooking integration
   */
  async integrationsEditBookingIntegration(
    _root,
    { _id, ...doc }: IEditIntegration,
    { user, models }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });

    const updated = await models.Integrations.updateBookingIntegration(_id, doc);

    return editIntegration(doc, integration, user, updated, models);
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
  'integrationsCopyLeadIntegration',
  'integrationsCreateLeadIntegration'
);
checkPermission(
  integrationMutations,
  'integrationsCreateBookingIntegration',
  'integrationsCreateBookingIntegration'
);
checkPermission(
  integrationMutations,
  'integrationsEditBookingIntegration',
  'integrationsEditBookingIntegration'
);

export default integrationMutations;