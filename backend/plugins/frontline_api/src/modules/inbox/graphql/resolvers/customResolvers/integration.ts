import { IIntegrationDocument } from '@/inbox/@types/integrations';
import { IContext } from '~/connectionResolvers';
import { facebookStatus } from '@/integrations/facebook/messageBroker';
import { graphRequest } from '@/integrations/facebook/utils';
import { IFacebookPageResponse } from '@/integrations/facebook/@types/integrations';
import { imapIntegrationDetails } from '@/integrations/imap/messageBroker';
export const integrationStatus = async (
  serviceName: string,
  subdomain: string,
  data: { integrationId: string },
) => {
  try {
    switch (serviceName) {
      case 'facebook':
        return await facebookStatus({ subdomain, data });

      case 'instagram':
        // TODO: Implement Instagram status check
        break;

      case 'mobinetSms':
        //  TODO: Implement mobinetSms status check
        break;

      default:
        throw new Error(`Unsupported service: ${serviceName}`);
    }
  } catch (e) {
    throw new Error(
      `Failed to check integration status for ${serviceName}. Error: ${e.message}. Please check the integrations list and resolve any issues.`,
    );
  }
};

export const integrationDetail = async (
  serviceName: string,
  subdomain: string,
  data: { integrationId: string },
) => {
  try {
    switch (serviceName) {
      case 'imap':
        return await imapIntegrationDetails({ subdomain, data });
    }
  } catch (e) {
    throw new Error(
      `Failed to check integration details for ${serviceName}. Error: ${e.message}`,
    );
  }
};

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Integrations.findOne({ _id });
  },

  async form(_args) {
    return null;
  },

  async channel(
    integration: IIntegrationDocument,
    _args,
    { models }: IContext,
  ) {
    if (integration?.channelId) {
      return models.Channels.findOne({
        _id: integration.channelId,
      });
    }
    return;
  },

  async tags(integration: IIntegrationDocument) {
    return (integration.tagIds || []).map((_id) => ({
      __typename: 'Tag',
      _id,
    }));
  },

  async websiteMessengerApps(_args) {
    return [];
  },

  async knowledgeBaseMessengerApps(_args) {
    return [];
  },

  async leadMessengerApps(_args) {
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
    try {
      const response = await integrationStatus(kind, subdomain, {
        integrationId: integration._id,
      });

      return response?.data;
    } catch (e) {
      return { status: 'healthy' };
    }
  },
  async details(
    integration: IIntegrationDocument,
    _args,
    { subdomain }: IContext,
  ) {
    console.log(integration, 'integration');
    console.log(_args, '_args');
    const inboxId: string = integration._id;

    const serviceName = integration.kind.includes('facebook')
      ? 'facebook'
      : integration.kind;

    if (integration.kind === 'messenger') {
      return null;
    }

    try {
      const detail = await integrationDetail(serviceName, subdomain, {
        integrationId: inboxId,
      });

      return detail;
    } catch (e) {
      console.error('error', e);

      return null;
    }
  },

  async facebookPage(
    integration: IIntegrationDocument,
    _args,
    { models }: IContext,
  ) {
    const serviceName = integration.kind.includes('facebook')
      ? 'facebook'
      : integration.kind;

    if (serviceName !== 'facebook') return null;

    try {
      const facebookIntegration = await models.FacebookIntegrations.findOne({
        erxesApiId: integration._id,
      });

      if (
        !facebookIntegration ||
        !Array.isArray(facebookIntegration.facebookPageIds)
      ) {
        console.warn('No facebookIntegration or no facebookPageIds found');
        return null;
      }

      const results = await Promise.all(
        facebookIntegration.facebookPageIds.map(async (pageId) => {
          const token = facebookIntegration.facebookPageTokensMap?.[pageId];
          if (!token) {
            console.warn(`Token not found for pageId: ${pageId}`);
            return null;
          }

          try {
            const response = (await graphRequest.get(
              `/${pageId}?fields=id,name`,
              token,
            )) as IFacebookPageResponse;
            return response ? { pageId, ...response } : null;
          } catch (err) {
            console.error(`Failed to fetch page ${pageId}:`, err);
            return null;
          }
        }),
      );

      const filtered = results.filter(Boolean) as ({
        pageId: string;
      } & IFacebookPageResponse)[];
      return filtered.length > 0 ? filtered : null;
    } catch (error) {
      console.error('Failed to fetch Facebook pages:', error);
      throw error;
    }
  },
};
