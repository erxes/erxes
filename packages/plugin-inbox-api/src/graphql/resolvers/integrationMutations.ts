import * as telemetry from 'erxes-telemetry';

import { getUniqueValue } from '@erxes/api-utils/src/core';
import { putActivityLog } from '@erxes/api-utils/src/logUtils';

import {
  IIntegration,
  IIntegrationDocument,
  IMessengerData,
  IUiOptions
} from '../../models/definitions/integrations';

import { IExternalIntegrationParams } from '../../models/Integrations';

import { debug } from '../../configs';
import messageBroker, {
  sendContactsMessage,
  sendIntegrationsMessage,
  sendCoreMessage,
  sendFormsMessage,
  sendCommonMessage
} from '../../messageBroker';

import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';

import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext, IModels } from '../../connectionResolver';
import { isServiceRunning } from '../../utils';

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
  models: IModels,
  subdomain: string,
  doc: IIntegration,
  integration: IIntegrationDocument,
  user: any,
  type: string
) => {
  if (doc.channelIds) {
    await models.Channels.updateMany(
      { _id: { $in: doc.channelIds } },
      { $push: { integrationIds: integration._id } }
    );
  }

  await putCreateLog(
    models,
    subdomain,
    {
      type: MODULE_NAMES.INTEGRATION,
      newData: { ...doc, createdUserId: user._id, isActive: true },
      object: integration
    },
    user
  );

  telemetry.trackCli('integration_created', { type });

  await sendCoreMessage({
    subdomain,
    action: 'registerOnboardHistory',
    data: {
      type: `${type}IntegrationCreated`,
      user
    }
  });

  return integration;
};

const editIntegration = async (
  subdomain: string,
  fields: IIntegration,
  integration: IIntegrationDocument,
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
    subdomain,
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
    { user, models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.createMessengerIntegration(
      doc,
      user._id
    );

    return createIntegration(
      models,
      subdomain,
      doc,
      integration,
      user,
      'messenger'
    );
  },

  /**
   * Updates a messenger integration
   */
  async integrationsEditMessengerIntegration(
    _root,
    { _id, ...fields }: IEditIntegration,
    { user, models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });
    const updated = await models.Integrations.updateMessengerIntegration(
      _id,
      fields
    );

    return editIntegration(
      subdomain,
      fields,
      integration,
      user,
      updated,
      models
    );
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
    { user, models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.createLeadIntegration(
      doc,
      user._id
    );

    return createIntegration(models, subdomain, doc, integration, user, 'lead');
  },

  /**
   * Edit a lead integration
   */
  async integrationsEditLeadIntegration(
    _root,
    { _id, ...doc }: IEditIntegration,
    { user, models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });

    const updated = await models.Integrations.updateLeadIntegration(_id, doc);

    return editIntegration(subdomain, doc, integration, user, updated, models);
  },

  /**
   * Create external integrations like twitter, gmail etc ...
   */
  async integrationsCreateExternalIntegration(
    _root,
    { data, ...doc }: IExternalIntegrationParams & { data: object },
    { user, models, subdomain }: IContext
  ) {
    const modifiedDoc: any = { ...doc };

    if (modifiedDoc.kind === 'webhook') {
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

    if (doc.channelIds && doc.channelIds.length === 0) {
      throw new Error('Channel must be chosen');
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

    const kind = doc.kind.split('-')[0];

    try {
      if ('webhook' !== kind) {
        await sendCommonMessage({
          serviceName: (await isServiceRunning(kind)) ? kind : 'integrations',
          subdomain,
          action: 'createIntegration',
          data: {
            kind,
            integrationId: integration._id,
            doc: {
              accountId: doc.accountId,
              kind: doc.kind,
              integrationId: integration._id,
              data: data ? JSON.stringify(data) : ''
            }
          },
          isRPC: true
        });
      }

      telemetry.trackCli('integration_created', { type: doc.kind });

      await putCreateLog(
        models,
        subdomain,
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
    { user, models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });

    const doc: any = { name, brandId, data };

    switch (integration.kind) {
      case 'webhook': {
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
      subdomain,
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
    { user, models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });

    try {
      const kind = integration.kind.split('-')[0];
      const commonParams = {
        subdomain,
        data: { integrationId: _id },
        isRPC: true,
        action: 'removeIntegrations'
      };

      if (await isServiceRunning(kind)) {
        await sendCommonMessage({ serviceName: kind, ...commonParams });
      } else {
        await sendIntegrationsMessage({ ...commonParams });
      }
    } catch (e) {
      if (e.message !== 'Integration not found') {
        debug.error(e);
        throw e;
      }
    }

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.INTEGRATION, object: integration },
      user
    );

    return models.Integrations.removeIntegration(_id);
  },

  /**
   * Delete an account
   */
  async integrationsRemoveAccount(
    _root,
    { _id, kind }: { _id: string; kind?: string },
    { models, subdomain }: IContext
  ) {
    try {
      const { erxesApiIds } = await sendCommonMessage({
        serviceName:
          kind && (await isServiceRunning(kind)) ? kind : 'integrations',
        subdomain,
        action: 'api_to_integrations',
        data: {
          action: 'remove-account',
          _id
        },
        isRPC: true
      });

      for (const id of erxesApiIds) {
        await models.Integrations.removeIntegration(id);
      }

      return 'success';
    } catch (e) {
      debug.error(e);
      throw e;
    }
  },

  async integrationsRepair(
    _root,
    { _id, kind }: { _id: string; kind: string },
    { subdomain }: IContext
  ) {
    try {
      const response = await sendCommonMessage({
        serviceName:
          kind && (await isServiceRunning(kind))
            ? kind.split('-')[0]
            : 'integrations',
        subdomain,
        action: 'api_to_integrations',
        data: {
          action: 'repair-integrations',
          _id
        },
        isRPC: true
      });

      return response;
    } catch (e) {
      debug.error(e);
      throw e;
    }
  },

  async integrationsArchive(
    _root,
    { _id, status }: IArchiveParams,
    { user, models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });

    await models.Integrations.updateOne(
      { _id },
      { $set: { isActive: !status } }
    );

    const updated = await models.Integrations.findOne({ _id });

    await putUpdateLog(
      models,
      subdomain,
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
    { user, subdomain }: IContext
  ) {
    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        primaryPhone: args.to
      },
      isRPC: true
    });

    if (!customer) {
      throw new Error(`Customer not found with primary phone "${args.to}"`);
    }
    if (customer.phoneValidationStatus !== 'valid') {
      throw new Error(`Customer's primary phone ${args.to} is not valid`);
    }

    try {
      const response = await sendIntegrationsMessage({
        subdomain,
        action: 'sendSms',
        data: args,
        isRPC: true
      });

      if (response && response.status === 'ok') {
        await putActivityLog(subdomain, {
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
    { docModifier, user, models, subdomain }: IContext
  ) {
    const sourceIntegration = await models.Integrations.getIntegration({ _id });

    if (!sourceIntegration.formId) {
      throw new Error('Integration kind is not form');
    }

    const sourceForm = await sendFormsMessage({
      subdomain,
      action: 'findOne',
      data: { _id: sourceIntegration.formId },
      isRPC: true
    });

    const sourceFields = await sendFormsMessage({
      subdomain,
      action: 'fields.find',
      data: { query: { contentTypeId: sourceForm._id } },
      isRPC: true
    });

    const formDoc = docModifier({
      ...sourceForm,
      title: `${sourceForm.title}-copied`
    });

    delete formDoc._id;
    delete formDoc.code;

    const copiedForm = await sendFormsMessage({
      subdomain,
      action: 'createForm',
      data: { formDoc, userId: user._id },
      isRPC: true
    });

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
      associatedFieldId: e.associatedFieldId,
      pageNumber: e.pageNumber
    }));

    sendFormsMessage({
      subdomain,
      action: 'fields.insertMany',
      data: { fields }
    });

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.INTEGRATION,
        newData: { ...doc, createdUserId: user._id, isActive: true },
        object: copiedIntegration
      },
      user
    );

    telemetry.trackCli('integration_created', { type: 'lead' });

    await sendCoreMessage({
      subdomain,
      action: 'registerOnboardHistory',
      data: {
        type: 'leadIntegrationCreate',
        user
      }
    });

    return copiedIntegration;
  },
  /**
   * Create a new booking integration
   */
  async integrationsCreateBookingIntegration(
    _root,
    doc: IIntegration,
    { user, models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.createBookingIntegration(
      doc,
      user._id
    );

    return createIntegration(
      models,
      subdomain,
      doc,
      integration,
      user,
      'booking'
    );
  },

  /**
   * Edit a boooking integration
   */
  async integrationsEditBookingIntegration(
    _root,
    { _id, ...doc }: IEditIntegration,
    { user, models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });

    const updated = await models.Integrations.updateBookingIntegration(
      _id,
      doc
    );

    return editIntegration(subdomain, doc, integration, user, updated, models);
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
