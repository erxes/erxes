import { KIND_CHOICES } from '../../models/definitions/constants';
import { IIntegrationDocument } from '../../models/definitions/integrations';
import { getDocument, getDocumentList } from '../../cacheUtils';
import { sendRPCMessage } from '../../messageBroker';
import { IContext } from '../../connectionResolver';

export default {
  __resolveReference(models, {_id}) {
    return models.Integrations.findOne({ _id })
  },
    brand(integration: IIntegrationDocument, _args, { models }: IContext) {
      return getDocument(models, 'brands', { _id: integration.brandId });
  },

  async form(integration: IIntegrationDocument) {
    if (!integration.formId) {
      return null;
    }

    return { __typename: 'Form', _id: integration.formId }
  },

  channels(integration: IIntegrationDocument, _args, { models }: IContext) {
    return getDocumentList(models, 'channels', {
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
    { dataSources }: IContext
  ) {
    if (integration.kind.includes('facebook')) {
      try {
        return sendRPCMessage('integrations:rpc_queue:getFacebookStatus', {
          integrationId: integration._id
        })
      } catch (e) {
        return { status: 'healthy' };
      }
    }

    return { status: 'healthy' };
  }
};