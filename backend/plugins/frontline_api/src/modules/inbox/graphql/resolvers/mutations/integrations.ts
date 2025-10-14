import {
  IIntegration,
  IMessengerData,
  IUiOptions,
  ITicketData,
  IOnboardingParamsEdit,
  IArchiveParams,
} from '@/inbox/@types/integrations';
import { IContext } from '~/connectionResolvers';
import { IExternalIntegrationParams } from '@/inbox/db/models/Integrations';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { getUniqueValue } from 'erxes-api-shared/utils';
import {
  facebookUpdateIntegrations,
  facebookRemoveIntegrations,
  facebookRemoveAccount,
  facebookRepairIntegrations,
  facebookCreateIntegrations,
} from '@/integrations/facebook/messageBroker';
import {
  callCreateIntegration,
  callRemoveIntergration,
  callUpdateIntegration,
} from '@/integrations/call/messageBroker';
import { IChannelDocument } from '@/channel/@types/channel';

interface IntegrationParams {
  integrationId: string;
}
interface CreateIntegrationParams {
  accountId: string;
  kind: string;
  integrationId: string;
  data?: string;
}

interface UpdateIntegrationDoc {
  accountId: string;
  kind: string;
  integrationId: string;
  channelId: string;
  data?: string;
}

interface UpdateIntegrationData {
  kind: string;
  integrationId: string;
  doc: UpdateIntegrationDoc;
}

export const sendCreateIntegration = async (
  subdomain: string,
  serviceName: string,
  data: CreateIntegrationParams,
) => {
  try {
    switch (serviceName) {
      case 'facebook':
        return await facebookCreateIntegrations({ subdomain, data });
      case 'calls':
        return await callCreateIntegration({ subdomain, data });

      case 'instagram':
        // TODO: Implement Instagram integration
        break;

      case 'mobinetSms':
        // TODO: Implement MobinetSms integration
        break;

      default:
        throw new Error(`Unsupported service: ${serviceName}`);
    }
  } catch (e) {
    throw new Error(
      `Your message not sent. Error: ${e.message}. Go to integrations list and fix it.`,
    );
  }
};

export const sendUpdateIntegration = async (
  subdomain: string,
  serviceName: string,
  data: UpdateIntegrationData,
) => {
  try {
    switch (serviceName) {
      case 'facebook':
        return await facebookUpdateIntegrations({ subdomain, data });
      case 'calls':
        return await callUpdateIntegration({ subdomain, data });
      case 'instagram':
        break;

      case 'mobinetSms':
        break;

      default:
        throw new Error(`Unsupported service: ${serviceName}`);
    }
  } catch (e) {
    throw new Error(
      `Your message not sent. Error: ${e.message}. Go to integrations list and fix it.`,
    );
  }
};

export const sendRemoveIntegration = async (
  subdomain: string,
  serviceName: string,
  data: IntegrationParams,
) => {
  try {
    switch (serviceName) {
      case 'facebook':
        return await facebookRemoveIntegrations({ subdomain, data });
      case 'calls':
        return await callRemoveIntergration({ subdomain, data });
      case 'instagram':
        break;

      case 'mobinetSms':
        break;

      default:
        throw new Error(`Unsupported service: ${serviceName}`);
    }
  } catch (e) {
    throw new Error(
      `Your message not sent. Error: ${e.message}. Go to integrations list and fix it.`,
    );
  }
};

export const sendRemoveAccount = async (
  subdomain: string,
  serviceName: string,
  data: IntegrationParams,
) => {
  try {
    switch (serviceName) {
      case 'facebook':
        return await facebookRemoveAccount({ subdomain, data });

      case 'instagram':
        break;

      case 'mobinetSms':
        break;

      default:
        throw new Error(`Unsupported service: ${serviceName}`);
    }
  } catch (e) {
    throw new Error(
      `Your message not sent. Error: ${e.message}. Go to Account list and fix it.`,
    );
  }
};

export const sendRepairIntegration = async (
  subdomain: string,
  serviceName: string,
  data: IntegrationParams,
) => {
  try {
    switch (serviceName) {
      case 'facebook':
        return await facebookRepairIntegrations({ subdomain, data });

      case 'instagram':
        break;

      case 'mobinetSms':
        break;

      default:
        throw new Error(`Unsupported service: ${serviceName}`);
    }
  } catch (e) {
    throw new Error(
      `Your message not sent. Error: ${e.message}. Go to Account list and fix it.`,
    );
  }
};

export const integrationMutations = {
  /**
   * Creates a new messenger onboarding
   */
  async integrationsCreateMessengerOnboarding(
    _root,
    doc: IOnboardingParamsEdit,
    { user, models }: IContext,
  ) {
    const integrationsCount = await models.Integrations.find(
      {},
    ).countDocuments();

    if (integrationsCount > 0) {
      return models.Integrations.findOne();
    }
    await sendTRPCMessage({
      pluginName: 'core',
      method: 'mutation',
      module: 'brands',
      action: 'create',
      input: { name: doc.brandName },
    });

    let channel = (await models.Channels.findOne({
      name: 'Default channel',
    })) as IChannelDocument;

    if (!channel) {
      channel = await models.Channels.createChannel({
        channelDoc: { name: 'Default channel' },
        adminId: user._id,
        memberIds: [],
      });
      await models.ChannelMembers.create({
        channelId: channel._id,
        memberId: user._id,
      });
    } else {
      const isMember = await models.ChannelMembers.exists({
        channelId: channel._id,
        memberId: user._id,
      });

      if (!isMember) {
        await models.ChannelMembers.create({
          channelId: channel._id,
          memberId: user._id,
        });
      }
    }

    const integrationDocs = {
      name: 'Default brand',
      channelId: channel._id,
      messengerData: {},
    } as IIntegration;

    const integration = await models.Integrations.createMessengerIntegration(
      integrationDocs,
      user._id,
    );

    const uiOptions = { ...doc };

    return await models.Integrations.saveMessengerAppearanceData(
      integration._id,
      uiOptions,
    );
  },

  async integrationsEditMessengerOnboarding(
    _root,
    { _id, brandId, ...fields }: any,
    { models }: IContext,
  ) {
    await sendTRPCMessage({
      pluginName: 'core',
      method: 'mutation',
      module: 'brands',
      action: 'updateOne',
      input: { _id: brandId, fields: { name: fields.brandName } },
    });
    const integration = await models.Integrations.getIntegration({ _id });

    if (!integration) {
      throw new Error('Integration not found');
    }

    const channel = await models.Channels.findOne({
      name: 'Default channel',
    });

    const integrationDocs = {
      name: 'Default brand',
      // brandId: brand._id,
      channelId: channel?._id,
    } as IIntegration;

    const updated = await models.Integrations.updateMessengerIntegration(
      _id,
      integrationDocs,
    );

    const uiOptions = { logo: fields.logo, color: fields.color };

    return await models.Integrations.saveMessengerAppearanceData(
      updated._id,
      uiOptions,
    );
  },

  /**
   * Creates a new messenger integration
   */

  async integrationsCreateMessengerIntegration(
    _root,
    doc: IIntegration,
    { user, models }: IContext,
  ) {
    return await models.Integrations.createMessengerIntegration(doc, user._id);
  },

  /**
   * Updates a messenger integration
   */
  async integrationsEditMessengerIntegration(
    _root,
    { _id, ...fields }: any,
    { models }: IContext,
  ) {
    const integration = await models.Integrations.getIntegration({ _id });

    if (!integration) {
      throw new Error('Integration not found');
    }

    return await models.Integrations.updateMessengerIntegration(_id, fields);
  },

  /**
   * Update/save messenger appearance data
   */
  async integrationsSaveMessengerAppearanceData(
    _root,
    { _id, uiOptions }: { _id: string; uiOptions: IUiOptions },
    { models }: IContext,
  ) {
    return models.Integrations.saveMessengerAppearanceData(_id, uiOptions);
  },

  /**
   * Update/save messenger data
   */
  async integrationsSaveMessengerConfigs(
    _root,
    {
      _id,
      messengerData,
    }: { _id: string; messengerData: IMessengerData; callData: any },
    { models }: IContext,
  ) {
    return models.Integrations.saveMessengerConfigs(_id, messengerData);
  },

  /**
   * Create a new messenger integration
   */
  async integrationsCreateLeadIntegration(
    _root,
    doc: IIntegration,
    { user, models }: IContext,
  ) {
    return await models.Integrations.createLeadIntegration(doc, user._id);
  },

  /**
   * Edit a lead integration
   */
  async integrationsEditLeadIntegration(
    _root,
    { _id, ...doc }: any,
    { models }: IContext,
  ) {
    const integration = await models.Integrations.getIntegration({ _id });

    if (!integration) {
      throw new Error('Integration not found');
    }

    return await models.Integrations.updateLeadIntegration(_id, doc);
  },

  /**
   * Create external integrations like twitter, gmail etc ...
   */
  async integrationsCreateExternalIntegration(
    _root,
    { data, ...doc }: IExternalIntegrationParams & { data: object },
    { user, models, subdomain }: IContext,
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
          'token',
        );
      }
    }

    const integration = await models.Integrations.createExternalIntegration(
      modifiedDoc,
      user._id,
    );

    const kind = doc.kind.split('-')[0];
    if (kind === 'cloudflarecalls') {
      data = { ...data, name: doc.name };
    }

    try {
      if ('webhook' !== kind) {
        const payload: CreateIntegrationParams = {
          accountId: doc.accountId,
          kind: doc.kind,
          integrationId: integration._id,
          data: data ? JSON.stringify(data) : '',
        };

        await sendCreateIntegration(subdomain, kind, payload);
      }
    } catch (e) {
      await models.Integrations.deleteOne({ _id: integration._id });
      throw new Error(e);
    }

    return integration;
  },

  async integrationsEditCommonFields(
    _root,
    { _id, name, details, channelId },
    { models, subdomain }: IContext,
  ) {
    const integration = await models.Integrations.getIntegration({ _id });

    const doc: any = { name, details };
    let { kind } = integration;
    if (kind === 'facebook-messenger' || kind === 'facebook-post') {
      kind = 'facebook';
    }
    if (kind === 'instagram-messenger' || kind === 'instagram-post') {
      kind = 'instagram';
    }
    await models.Integrations.updateOne(
      { _id },
      { $set: { ...doc, ...(channelId && { channelId }) } },
    );

    const updated = await models.Integrations.getIntegration({ _id });

    const serviceName = integration.kind.split('-')[0];
    await sendUpdateIntegration(subdomain, serviceName, {
      kind,
      integrationId: integration._id,
      doc: {
        accountId: doc.accountId,
        kind: kind,
        integrationId: integration._id,
        channelId: doc.channelId,
        data: details ? JSON.stringify(details) : '',
      },
    });

    return updated;
  },

  /**
   * Deletes an integration
   */
  async integrationsRemove(
    _root,
    { _id }: { _id: string },
    { models, subdomain }: IContext,
  ) {
    const integration = await models.Integrations.getIntegration({ _id });
    const kind = integration.kind.split('-')[0];

    if (!['lead', 'messenger'].includes(kind)) {
      try {
        await sendRemoveIntegration(subdomain, kind, { integrationId: _id });
      } catch (e) {
        if (e.message !== 'Integration not found') {
          throw new Error(e);
        }
      }
    }

    return models.Integrations.removeIntegration(_id);
  },

  /**
   * Delete an account
   */
  async integrationsRemoveAccount(
    _root,
    { _id, kind }: { _id: string; kind?: string },
    { subdomain }: IContext,
  ) {
    try {
      if (kind) {
        const serviceName = kind.split('-')[0];

        try {
          await sendRemoveAccount(
            subdomain,
            serviceName, // kind should be explicitly set
            { integrationId: _id },
          );
        } catch (error) {
          console.error('Error during account removal process:', error);
          throw error;
        }
      }
      return 'success';
    } catch (error) {
      console.error(`Failed to remove ${kind} integration ${_id}:`, error);
      throw new Error(`Failed to remove ${kind} integration. ${error.message}`);
    }
  },

  async integrationsRepair(
    _root,
    { _id, kind }: { _id: string; kind: string },
    { subdomain }: IContext,
  ) {
    try {
      if (!_id) {
        throw new Error('Integration ID is required for repair');
      }
      if (!kind) {
        throw new Error('Integration kind is required for repair');
      }

      const serviceName = kind.split('-')[0];

      return await sendRepairIntegration(subdomain, serviceName, {
        integrationId: _id,
      });
    } catch (error) {
      console.error(`Failed to repair ${kind} integration ${_id}:`, error);
      // Convert to a more user-friendly error if needed
      throw new Error(`Failed to repair ${kind} integration. ${error.message}`);
    }
  },
  async integrationsArchive(
    _root,
    { _id, status }: IArchiveParams,
    { models }: IContext,
  ) {
    await models.Integrations.updateOne(
      { _id },
      { $set: { isActive: !status } },
    );
    const updated = await models.Integrations.findOne({ _id });

    return updated;
  },

  async integrationsCopyLeadIntegration(
    _root,
    { _id }: { _id },
    { models, user }: IContext,
  ) {
    const sourceIntegration = await models.Integrations.getIntegration({ _id });

    if (!sourceIntegration.formId) {
      throw new Error('Integration kind is not form');
    }
    const leadData = sourceIntegration.leadData;
    const doc = {
      ...sourceIntegration.toObject(),
      name: `${sourceIntegration.name}-copied`,
      leadData: leadData && {
        ...leadData.toObject(),
        viewCount: 0,
        contactsGathered: 0,
      },
    };
    const copiedIntegration = await models.Integrations.createLeadIntegration(
      doc,
      user._id,
    );
    return copiedIntegration;
  },

  async integrationsSaveMessengerTicketData(
    _root,
    { _id, ticketData }: { _id: string; ticketData: ITicketData },
    { models }: IContext,
  ) {
    return models.Integrations.integrationsSaveMessengerTicketData(
      _id,
      ticketData,
    );
  },
};
