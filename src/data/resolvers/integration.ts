import { Brands, Channels, Forms, MessengerApps, Tags } from '../../db/models';
import { KIND_CHOICES } from '../../db/models/definitions/constants';
import { IIntegrationDocument } from '../../db/models/definitions/integrations';
import { debugExternalApi } from '../../debuggers';
import { IContext } from '../types';

export default {
  brand(integration: IIntegrationDocument) {
    return Brands.findOne({ _id: integration.brandId });
  },

  form(integration: IIntegrationDocument) {
    return Forms.findOne({ _id: integration.formId });
  },

  channels(integration: IIntegrationDocument) {
    return Channels.find({ integrationIds: { $in: [integration._id] } });
  },

  tags(integration: IIntegrationDocument) {
    return Tags.find({ _id: { $in: integration.tagIds || [] } });
  },

  websiteMessengerApps(integration: IIntegrationDocument) {
    if (integration.kind === KIND_CHOICES.MESSENGER) {
      return MessengerApps.find({ kind: 'website', 'credentials.integrationId': integration._id });
    }
    return [];
  },

  knowledgeBaseMessengerApps(integration: IIntegrationDocument) {
    if (integration.kind === KIND_CHOICES.MESSENGER) {
      return MessengerApps.find({ kind: 'knowledgebase', 'credentials.integrationId': integration._id });
    }
    return [];
  },

  leadMessengerApps(integration: IIntegrationDocument) {
    if (integration.kind === KIND_CHOICES.MESSENGER) {
      return MessengerApps.find({ kind: 'lead', 'credentials.integrationId': integration._id });
    }
    return [];
  },

  externalData(integration: IIntegrationDocument, _args, { dataSources }: IContext) {
    try {
      return dataSources.IntegrationsAPI.fetchApi('/integrationDetail', { erxesApiId: integration._id });
    } catch (e) {
      debugExternalApi(e);
      return null;
    }
  },
};
