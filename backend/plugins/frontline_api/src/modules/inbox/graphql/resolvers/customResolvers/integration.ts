import { IIntegrationDocument } from '@/inbox/@types/integrations';
import { IContext } from '~/connectionResolvers';
import { facebookStatus } from '@/integrations/facebook/messageBroker';
import { graphRequest } from '@/integrations/facebook/utils';
import { IFacebookPageResponse } from '@/integrations/facebook/@types/integrations';
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

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Integrations.findOne({ _id });
  },
  // brand(integration: IIntegrationDocument) {
  //   if (!integration.brandId) {
  //     return null;
  //   }
  //   return (
  //     integration.brandId && {
  //       __typename: 'Brand',
  //       _id: integration.brandId,
  //     }
  //   );
  // },

  async form(
    integration: IIntegrationDocument,
    _args,
    { subdomain }: IContext,
  ) {
    return null;
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
    return [];
  },

  async knowledgeBaseMessengerApps(
    integration: IIntegrationDocument,
    _args,
    { models }: IContext,
  ) {
    return [];
  },

  async leadMessengerApps(
    integration: IIntegrationDocument,
    _args,
    { models }: IContext,
  ) {
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
    const serviceName = integration.kind.includes('facebook')
      ? 'facebook'
      : integration.kind;

    if (integration.kind === 'messenger') {
      return null;
    }
    return serviceName;
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
