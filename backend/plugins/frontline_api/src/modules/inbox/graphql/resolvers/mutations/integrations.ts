import { ChannelScopes, IChannelDocument } from '@/channel/@types/channel';
import {
  IArchiveParams,
  IIntegration,
  IMessengerData,
  IOnboardingParamsEdit,
  IUiOptions,
} from '@/inbox/@types/integrations';
import { IExternalIntegrationParams } from '@/inbox/db/models/Integrations';
import {
  callCreateIntegration,
  callRemoveIntergration,
  callUpdateIntegration,
} from '@/integrations/call/messageBroker';
import {
  imapCreateIntegration,
  imapUpdateIntegration,
  imapRemoveIntegrations,
} from '~/modules/integrations/imap/messageBroker';
import {
  mailCreateIntegration,
  mailUpdateIntegration,
  mailRemoveIntegrations,
} from '~/modules/integrations/mail/messageBroker';
import {
  facebookCreateIntegrations,
  facebookRemoveAccount,
  facebookRemoveIntegrations,
  facebookRepairIntegrations,
  facebookUpdateIntegrations,
} from '@/integrations/facebook/messageBroker';
import {
  instagramCreateIntegrations,
  instagramRemoveIntegrations,
  instagramRemoveAccount,
  instagramRepairIntegrations,
  instagramUpdateIntegrations,
} from '@/integrations/instagram/messageBroker';
import {
  discordCreateIntegrations,
  discordRemoveIntegrations,
  discordRepairIntegrations,
} from '@/integrations/discord/messageBroker';
import {
  callProCreateIntegration,
  callProRemoveIntegration,
  callProUpdateIntegration,
} from '@/integrations/callpro/messageBroker';
import {
  getUniqueValue,
  sendTRPCMessage,
  markResolvers,
} from 'erxes-api-shared/utils';
import { IContext, IModels } from '~/connectionResolvers';

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
      case 'imap':
        return await imapCreateIntegration({ subdomain, data });

      case 'mail':
        return await mailCreateIntegration({ subdomain, data });

      case 'instagram':
        return await instagramCreateIntegrations({ subdomain, data });

      case 'discord':
        return await discordCreateIntegrations({ subdomain, data });

      case 'callpro': {
        const result = await callProCreateIntegration({ subdomain, data });

        if (result.status !== 'success') {
          throw new Error(result.errorMessage);
        }

        return result;
      }

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
        return await instagramUpdateIntegrations({ subdomain, data });
      case 'imap':
        return await imapUpdateIntegration({ subdomain, data });

      case 'mail':
        return await mailUpdateIntegration({ subdomain, data });

      case 'callpro':
        return await callProUpdateIntegration({ subdomain, data });

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
        return await instagramRemoveIntegrations({ subdomain, data });
      case 'imap':
        return await imapRemoveIntegrations({ subdomain, data });

      case 'mail':
        return await mailRemoveIntegrations({ subdomain, data });

      case 'discord':
        return await discordRemoveIntegrations({ subdomain, data });

      case 'callpro':
        return await callProRemoveIntegration({ subdomain, data });

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
        return await instagramRemoveAccount({ subdomain, data });

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
        return await instagramRepairIntegrations({ subdomain, data });

      case 'discord':
        return await discordRepairIntegrations({ subdomain, data });

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


const createOnService = async (
  models: IModels,
  subdomain: string,
  serviceKind: string,
  payload: CreateIntegrationParams,
) => {
  if (serviceKind === 'webhook') {
    return;
  }

  try {
    const result = await sendCreateIntegration(subdomain, serviceKind, payload);

    if (result?.status === 'error') {
      throw new Error(result.errorMessage || 'Failed to create integration');
    }
  } catch (e) {
    await models.Integrations.deleteOne({ _id: payload.integrationId });
    throw e instanceof Error ? e : new Error(String(e));
  }
};

export const integrationMutations = {
  async integrationsCreateMessengerOnboarding(
    _root,
    doc: IOnboardingParamsEdit,
    { user, models, subdomain }: IContext,
  ) {
    const integrationsCount = await models.Integrations.find(
      {},
    ).countDocuments();

    if (integrationsCount > 0) {
      return models.Integrations.findOne();
    }
    await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'mutation',
      module: 'brands',
      action: 'create',
      input: { name: doc.brandName },
    });

    let channel = (await models.Channels.findOne({
      name: 'Default channel',
    })) as IChannelDocument;

    if (channel) {
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
    } else {
      channel = await models.Channels.createChannel({
        channelDoc: { name: 'Default channel' },
        adminId: user._id,
        memberIds: [],
      });
      await models.ChannelMembers.create({
        channelId: channel._id,
        memberId: user._id,
      });
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
    { models, subdomain }: IContext,
  ) {
    await sendTRPCMessage({
      subdomain,

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
      channelId: channel?._id,
    } as IIntegration;

    const updated = await models.Integrations.updateMessengerIntegration(
      _id,
      integrationDocs,
    );

    const uiOptions = { logo: fields.logo, primary: fields.primary };

    return await models.Integrations.saveMessengerAppearanceData(
      updated._id,
      uiOptions,
    );
  },

  async integrationsCreateMessengerIntegration(
    _root,
    doc: IIntegration,
    { user, models }: IContext,
  ) {
    return await models.Integrations.createMessengerIntegration(doc, user._id);
  },

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

  async integrationsSaveMessengerAppearanceData(
    _root,
    {
      _id,
      uiOptions,
      brandId,
    }: { _id: string; uiOptions: IUiOptions; brandId: string },
    { models }: IContext,
  ) {
    if (brandId) {
      await models.Integrations.updateOne({ _id }, { $set: { brandId } });
    }
    return models.Integrations.saveMessengerAppearanceData(_id, uiOptions);
  },

  async integrationsSaveMessengerConfigs(
    _root,
    {
      _id,
      messengerData,
      brandId,
    }: {
      _id: string;
      messengerData: IMessengerData;
      callData: any;
      brandId: string;
    },
    { models }: IContext,
  ) {
    if (brandId) {
      await models.Integrations.updateOne({ _id }, { $set: { brandId } });
    }

    const { websiteApps, ...messengerDataWithoutApps } = messengerData ?? {};

    if (Array.isArray(websiteApps)) {
      await models.MessengerApps.deleteMany({
        kind: 'website',
        'credentials.integrationId': _id,
      });

      if (websiteApps.length > 0) {
        await models.MessengerApps.insertMany(
          websiteApps.map((app) => ({
            kind: 'website',
            showInInbox: app.showInInbox ?? false,
            credentials: { ...app.credentials, integrationId: _id },
          })),
        );
      }
    }

    return models.Integrations.saveMessengerConfigs(
      _id,
      messengerDataWithoutApps as IMessengerData,
    );
  },

  async integrationsSaveMessengerColorTheme(
    _root,
    { _id, colorTheme }: { _id: string; colorTheme: any },
    { models }: IContext,
  ) {
    return models.Integrations.saveMessengerColorTheme(_id, colorTheme);
  },

  async integrationsGetMessengerColorThemes(_root, _args) {
    return [
      {
        _id: '',
        primary: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
      },
    ];
  },
  async integrationsCreateLeadIntegration(
    _root,
    doc: IIntegration,
    { user, models }: IContext,
  ) {
    return await models.Integrations.createLeadIntegration(doc, user._id);
  },

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

  async integrationsCreateExternalIntegration(
    _root,
    { data, ...doc }: IExternalIntegrationParams & { data: object },
    { user, models, subdomain }: IContext,
  ) {
    const modifiedDoc: IExternalIntegrationParams & {
      webhookData?: Record<string, unknown>;
    } = { ...doc };
    const serviceKind = doc.kind.split('-')[0];

    if (modifiedDoc.channelId) {
      const channel = await models.Channels.findOne({
        _id: modifiedDoc.channelId,
      });

      if (!channel) {
        throw new Error(
          `Channel "${modifiedDoc.channelId}" not found — cannot create an integration on a channel that doesn't exist.`,
        );
      }

      if (
        channel.scope === ChannelScopes.PERSONAL &&
        channel.createdBy !== user._id
      ) {
        throw new Error(
          "Cannot create an integration on another user's personal channel.",
        );
      }
    } else {
      // No channel named: the integration lands in the connecting user's own
      // inbox. A personal channel accepts every kind a team channel does, so
      // this fallback is not restricted by kind.
      const personalChannel = await models.Channels.getPersonalChannel(
        user._id,
      );

      modifiedDoc.channelId = personalChannel._id;
    }

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

    if (serviceKind === 'cloudflarecalls') {
      data = { ...data, name: doc.name };
    }

    await createOnService(models, subdomain, serviceKind, {
      accountId: doc.accountId,
      kind: doc.kind,
      integrationId: integration._id,
      data: data ? JSON.stringify(data) : '',
    });

    return integration;
  },

  async integrationsEditCommonFields(
    _root,
    { _id, name, details, channelId, brandId },
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
      {
        $set: {
          ...doc,
          ...(channelId && { channelId }),
          ...(brandId && { brandId }),
        },
      },
    );

    const updated = await models.Integrations.getIntegration({ _id });

    const serviceName = integration.kind.split('-')[0];
    const result = await sendUpdateIntegration(subdomain, serviceName, {
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

    if (result?.status === 'error') {
      throw new Error(result.errorMessage || 'Failed to update integration');
    }

    return updated;
  },

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

  async integrationsRemoveAccount(
    _root,
    { _id, kind }: { _id: string; kind?: string },
    { subdomain }: IContext,
  ) {
    if (kind) {
      const serviceName = kind.split('-')[0];
      await sendRemoveAccount(subdomain, serviceName, { integrationId: _id });
    }
    return 'success';
  },

  async integrationsRepair(
    _root,
    { _id, kind }: { _id: string; kind: string },
    { subdomain }: IContext,
  ) {
    const serviceName = kind.split('-')[0];
    return sendRepairIntegration(subdomain, serviceName, {
      integrationId: _id,
    });
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
    { _id, configIds }: { _id: string; configIds?: string[] },
    { models }: IContext,
  ) {
    return models.Integrations.integrationsSaveMessengerTicketData(
      _id,
      configIds,
    );
  },
};

markResolvers(integrationMutations, {
  wrapperConfig: {
    skipPermission: true,
  },
});
