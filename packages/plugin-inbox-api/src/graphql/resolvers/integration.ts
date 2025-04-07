import { IIntegrationDocument } from '../../models/definitions/integrations';
import {
  sendCommonMessage,
  sendIntegrationsMessage,
} from '../../messageBroker';
import { IContext } from '../../connectionResolver';
import { isServiceRunning } from '../../utils';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Integrations.findOne({ _id });
  },
  brand(integration: IIntegrationDocument) {
    if (!integration.brandId) {
      return null;
    }
    return (
      integration.brandId && {
        __typename: 'Brand',
        _id: integration.brandId,
      }
    );
  },

  async form(
    integration: IIntegrationDocument,
    _args,
    { subdomain }: IContext,
  ) {
    return sendCommonMessage({
      serviceName: 'core',
      action: 'formsFindOne',
      data: {
        integrationId: integration._id,
      },
      subdomain,
      isRPC: true,
      defaultValue: null,
    });
  },

  async channels(
    integration: IIntegrationDocument,
    _args,
    { models }: IContext,
  ) {
    return models.Channels.find({
      integrationIds: { $in: [integration._id] },
    });
  },

  async tags(integration: IIntegrationDocument) {
    return (integration.tagIds || []).map((_id) => ({
      __typename: 'Tag',
      _id,
    }));
  },

  async websiteMessengerApps(
    integration: IIntegrationDocument,
    _args,
    { models }: IContext,
  ) {
    if (integration.kind === 'messenger') {
      return models.MessengerApps.find({
        kind: 'website',
        'credentials.integrationId': integration._id,
      });
    }
    return [];
  },

  async knowledgeBaseMessengerApps(
    integration: IIntegrationDocument,
    _args,
    { models }: IContext,
  ) {
    if (integration.kind === 'messenger') {
      return models.MessengerApps.find({
        kind: 'knowledgebase',
        'credentials.integrationId': integration._id,
      });
    }
    return [];
  },

  async leadMessengerApps(
    integration: IIntegrationDocument,
    _args,
    { models }: IContext,
  ) {
    if (integration.kind === 'messenger') {
      return models.MessengerApps.find({
        kind: 'lead',
        'credentials.integrationId': integration._id,
      });
    }
    return [];
  },

  async healthStatus(
    integration: IIntegrationDocument,
    _args,
    { subdomain }: IContext,
  ) {
    const kind = integration.kind.includes('facebook')
      ? 'facebook'
      : integration.kind.split('-')[0];

    if (kind === 'messenger') {
      return { status: 'healthy' };
    }

    const serviceRunning = await isServiceRunning(kind);

    if (serviceRunning) {
      try {
        const status = await sendCommonMessage({
          serviceName: kind,
          subdomain,
          action: 'getStatus',
          data: {
            integrationId: integration._id,
          },
          isRPC: true,
        });

        return status;
      } catch (e) {
        return { status: 'healthy' };
      }
    }

    return { status: 'healthy' };
  },

  async details(
    integration: IIntegrationDocument,
    _args,
    { subdomain }: IContext,
  ) {
    const inboxId: string = integration._id;

    const serviceName = integration.kind.includes('facebook')
      ? 'facebook'
      : integration.kind;

    if (integration.kind === 'messenger') {
      return null;
    }

    if (
      integration.kind === 'callpro' &&
      (await isServiceRunning('integrations'))
    ) {
      return await sendIntegrationsMessage({
        subdomain,
        action: 'api_to_integrations',
        data: { inboxId, action: 'getDetails', integrationId: inboxId },
        isRPC: true,
      });
    }

    const serviceRunning = await isServiceRunning(serviceName);

    if (serviceRunning) {
      try {
        const a = await sendCommonMessage({
          serviceName,
          subdomain,
          action: 'api_to_integrations',
          data: { inboxId, integrationId: inboxId, action: 'getDetails' },
          isRPC: true,
          defaultValue: null,
        });

        return a;
      } catch (e) {
        console.error('error', e);

        return null;
      }
    }
  },

  async callData(
    integration: IIntegrationDocument,
    _args,
    { subdomain }: IContext,
  ) {
    const inboxId: string = integration._id;

    if (integration.kind !== 'messenger') {
      return null;
    }

    const serviceRunning = await isServiceRunning('cloudflarecalls');

    if (serviceRunning) {
      try {
        const integrationDetails = await sendCommonMessage({
          serviceName: 'cloudflarecalls',
          subdomain,
          action: 'api_to_integrations',
          data: { inboxId, integrationId: inboxId, action: 'getDetails' },
          isRPC: true,
          defaultValue: null,
        });

        const isReceiveWebCall =
          integrationDetails.status === 'active' ? true : false;

        return (
          {
            header: integrationDetails.header || '',
            description: integrationDetails.description || '',
            departments: integrationDetails.departments,
            isReceiveWebCall,
          } || {}
        );
      } catch (e) {
        console.error('error', e);

        return null;
      }
    }
  },
};
