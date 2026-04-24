import { IIntegrationDocument } from '@/inbox/@types/integrations';
import { IContext } from '~/connectionResolvers';
import { facebookStatus } from '@/integrations/facebook/messageBroker';
import { graphRequest } from '@/integrations/facebook/utils';
import { IFacebookPageResponse } from '@/integrations/facebook/@types/integrations';
import { imapIntegrationDetails } from '@/integrations/imap/messageBroker';
import { graphRequest as instagramGraphRequest } from '@/integrations/instagram/utils';
import { instagramStatus } from '@/integrations/instagram/messageBroker';
import { debugError } from '~/modules/inbox/utils';

const getServiceName = (kind: string): string => {
  if (kind.includes('facebook')) return 'facebook';
  if (kind.includes('instagram')) return 'instagram';
  return kind.split('-')[0];
};

export const integrationStatus = async (
  serviceName: string,
  subdomain: string,
  data: { integrationId: string },
) => {
  switch (serviceName) {
    case 'facebook':
      return facebookStatus({ subdomain, data });
    case 'instagram':
      return instagramStatus({ subdomain, data });
    default:
      return null;
  }
};

export const integrationDetail = async (
  serviceName: string,
  subdomain: string,
  data: { integrationId: string },
) => {
  switch (serviceName) {
    case 'imap':
      return imapIntegrationDetails({ subdomain, data });
    default:
      return null;
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
      return models.Channels.findOne({ _id: integration.channelId });
    }
    return null;
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
    const serviceName = getServiceName(integration.kind);

    if (serviceName === 'messenger') {
      return { status: 'healthy' };
    }

    try {
      const response = await integrationStatus(serviceName, subdomain, {
        integrationId: integration._id,
      });
      return response?.data ?? { status: 'healthy' };
    } catch (e) {
      return { status: 'healthy' };
    }
  },

  async details(
    integration: IIntegrationDocument,
    _args,
    { subdomain }: IContext,
  ) {
    if (integration.kind === 'messenger') return null;

    const serviceName = getServiceName(integration.kind);

    try {
      return await integrationDetail(serviceName, subdomain, {
        integrationId: integration._id,
      });
    } catch (e) {
      debugError(`integrationDetail error: ${e.message}`);
      return null;
    }
  },

  async facebookPage(
    integration: IIntegrationDocument,
    _args,
    { models }: IContext,
  ) {
    if (!integration.kind.includes('facebook')) return null;

    try {
      const facebookIntegration = await models.FacebookIntegrations.findOne({
        erxesApiId: integration._id,
      });

      if (
        !facebookIntegration ||
        !Array.isArray(facebookIntegration.facebookPageIds)
      ) {
        return null;
      }

      const results = await Promise.all(
        facebookIntegration.facebookPageIds.map(async (pageId) => {
          const token = facebookIntegration.facebookPageTokensMap?.[pageId];
          if (!token) return null;

          try {
            const response = (await graphRequest.get(
              `/${pageId}?fields=id,name`,
              token,
            )) as IFacebookPageResponse;
            return response ? { pageId, ...response } : null;
          } catch (err) {
            debugError(`Failed to fetch page ${pageId}: ${err.message}`);
            return null;
          }
        }),
      );

      const filtered = results.filter(Boolean) as ({
        pageId: string;
      } & IFacebookPageResponse)[];
      return filtered.length > 0 ? filtered : null;
    } catch (error) {
      debugError(`Failed to fetch Facebook pages: ${error.message}`);
      return null;
    }
  },

  async instagramPage(
    integration: IIntegrationDocument,
    _args,
    { models }: IContext,
  ) {
    if (!integration.kind.includes('instagram')) return null;

    try {
      const igIntegration = await models.InstagramIntegrations.findOne({
        erxesApiId: integration._id,
      });

      if (!igIntegration) return null;

      const instagramPageId = igIntegration.instagramPageIds?.[0];
      if (!instagramPageId) return null;

      const account = await models.InstagramAccounts.findOne({
        _id: igIntegration.accountId,
      });

      if (!account?.token) return null;

      const info: any = await instagramGraphRequest.get(
        `${instagramPageId}?fields=id,username`,
        account.token,
      );

      return info ? [{ id: info.id, name: info.username }] : null;
    } catch (error) {
      debugError(`Failed to fetch Instagram page: ${error.message}`);
      return null;
    }
  },
};
