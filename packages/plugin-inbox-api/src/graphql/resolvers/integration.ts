import { Integrations, MessengerApps } from '../../models';
import { KIND_CHOICES } from '../../models/definitions/constants';
import { IIntegrationDocument } from '../../models/definitions/integrations';
import { IContext } from '@erxes/api-utils/src';
import { getDocument, getDocumentList } from '../../cacheUtils';
import { sendRPCMessage } from '../../messageBroker';

export default {
  __resolveReference({_id}) {
    return Integrations.findOne({ _id })
  },
  brand(integration: IIntegrationDocument) {
    return getDocument('brands', { _id: integration.brandId });
  },

  async form(integration: IIntegrationDocument) {
    if (!integration.formId) {
      return null;
    }

    return { __typename: 'Form', _id: integration.formId }
  },

  channels(integration: IIntegrationDocument) {
    return getDocumentList('channels', {
      integrationIds: { $in: [integration._id] }
    });
  },

  async tags(integration: IIntegrationDocument) {
    return (integration.tagIds || []).map((_id) => ({ __typename: 'Tag', _id }));
  },

  websiteMessengerApps(integration: IIntegrationDocument) {
    if (integration.kind === KIND_CHOICES.MESSENGER) {
      return MessengerApps.find({
        kind: 'website',
        'credentials.integrationId': integration._id
      });
    }
    return [];
  },

  knowledgeBaseMessengerApps(integration: IIntegrationDocument) {
    if (integration.kind === KIND_CHOICES.MESSENGER) {
      return MessengerApps.find({
        kind: 'knowledgebase',
        'credentials.integrationId': integration._id
      });
    }
    return [];
  },

  leadMessengerApps(integration: IIntegrationDocument) {
    if (integration.kind === KIND_CHOICES.MESSENGER) {
      return MessengerApps.find({
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