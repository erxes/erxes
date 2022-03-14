import { KIND_CHOICES } from '../../models/definitions/constants';
import { IIntegrationDocument } from '../../models/definitions/integrations';
import { getDocument, getDocumentList } from '../../cacheUtils';
import { sendIntegrationsMessage } from '../../messageBroker';
import { IContext } from '../../connectionResolver';

export default {
  __resolveReference({_id}, { models }: IContext) {
    return models.Integrations.findOne({ _id })
  },
    brand(integration: IIntegrationDocument, _args, { models, coreModels, subdomain }: IContext) {
      return getDocument(models, coreModels, subdomain, 'brands', { _id: integration.brandId });
  },

  async form(integration: IIntegrationDocument) {
    if (!integration.formId) {
      return null;
    }

    return { __typename: 'Form', _id: integration.formId }
  },

  channels(integration: IIntegrationDocument, _args, { models, coreModels, subdomain }: IContext) {
    return getDocumentList(models, coreModels, subdomain, 'channels', {
      integrationIds: { $in: [integration._id] }
    });
  },

  async tags(integration: IIntegrationDocument) {
    return (integration.tagIds || []).map((_id) => ({ __typename: 'Tag', _id }));
  },

  websiteMessengerApps(integration: IIntegrationDocument, _args, { models }: IContext) {
    if (integration.kind === KIND_CHOICES.MESSENGER) {
      return models.MessengerApps.find({
        kind: 'website',
        'credentials.integrationId': integration._id
      });
    }
    return [];
  },

  knowledgeBaseMessengerApps(integration: IIntegrationDocument, _args, { models }: IContext) {
    if (integration.kind === KIND_CHOICES.MESSENGER) {
      return models.MessengerApps.find({
        kind: 'knowledgebase',
        'credentials.integrationId': integration._id
      });
    }
    return [];
  },

  leadMessengerApps(integration: IIntegrationDocument, _args, { models }: IContext) {
    if (integration.kind === KIND_CHOICES.MESSENGER) {
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
    if (integration.kind.includes('facebook')) {
      try {
        return sendIntegrationsMessage({
          subdomain,
          action: 'getFacebookStatus',
          data: {
            integrationId: integration._id
          },
          isRPC: true
        });
      } catch (e) {
        return { status: 'healthy' };
      }
    }

    return { status: 'healthy' };
  }
};