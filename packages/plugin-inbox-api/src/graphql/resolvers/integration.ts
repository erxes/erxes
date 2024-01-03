import { IIntegrationDocument } from '../../models/definitions/integrations';
import {
  sendCommonMessage,
  sendIntegrationsMessage
} from '../../messageBroker';
import { IContext } from '../../connectionResolver';
import { isServiceRunning } from '../../utils';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Integrations.findOne({ _id });
  },
  brand(integration: IIntegrationDocument) {
    if (!integration.brandId) {
      return null;
    }
    return (
      integration.brandId && {
        __typename: 'Brand',
        _id: integration.brandId
      }
    );
  },

  async form(integration: IIntegrationDocument) {
    if (!integration.formId) {
      return null;
    }

    return { __typename: 'Form', _id: integration.formId };
  },

  channels(integration: IIntegrationDocument, _args, { models }: IContext) {
    return models.Channels.find({
      integrationIds: { $in: [integration._id] }
    });
  },

  async tags(integration: IIntegrationDocument) {
    return (integration.tagIds || []).map(_id => ({
      __typename: 'Tag',
      _id
    }));
  },

  websiteMessengerApps(
    integration: IIntegrationDocument,
    _args,
    { models }: IContext
  ) {
    if (integration.kind === 'messenger') {
      return models.MessengerApps.find({
        kind: 'website',
        'credentials.integrationId': integration._id
      });
    }
    return [];
  },

  knowledgeBaseMessengerApps(
    integration: IIntegrationDocument,
    _args,
    { models }: IContext
  ) {
    if (integration.kind === 'messenger') {
      return models.MessengerApps.find({
        kind: 'knowledgebase',
        'credentials.integrationId': integration._id
      });
    }
    return [];
  },

  leadMessengerApps(
    integration: IIntegrationDocument,
    _args,
    { models }: IContext
  ) {
    if (integration.kind === 'messenger') {
      return models.MessengerApps.find({
        kind: 'lead',
        'credentials.integrationId': integration._id
      });
    }
    return [];
  },

  async healthStatus(
    integration: IIntegrationDocument,
    _args,
    { subdomain }: IContext
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
            integrationId: integration._id
          },
          isRPC: true
        });

        return status;
      } catch (e) {
        return { status: 'healthy' };
      }
    }

    return { status: 'healthy' };
  },

  async data(
    integration: IIntegrationDocument,
    _args,
    { subdomain }: IContext
  ) {
    const inboxId: string = integration._id;

    const serviceName = integration.kind.includes('facebook')
      ? 'facebook'
      : integration.kind;

    if (integration.kind === 'messenger') {
      return null;
    }

    const serviceRunning = await isServiceRunning(serviceName);

    if (serviceRunning) {
      try {
        return await sendCommonMessage({
          serviceName,
          subdomain,
          action: 'api_to_integrations',
          data: { inboxId, action: 'getData', integrationId: inboxId },
          isRPC: true
        });
      } catch (e) {
        console.error('error', e);

        return null;
      }
    }
  },

  async details(
    integration: IIntegrationDocument,
    _args,
    { subdomain }: IContext
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
        isRPC: true
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
          defaultValue: null
        });

        return a;
      } catch (e) {
        console.error('error', e);

        return null;
      }
    }
  }
};
