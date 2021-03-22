import { Forms, KnowledgeBaseTopics, MessengerApps } from '../../../db/models';
import { IFormDocument } from '../../../db/models/definitions/forms';
import { ITopicDocument } from '../../../db/models/definitions/knowledgebase';

interface IWebsite {
  description?: string;
  buttonText?: string;
  url?: string;
}

const messengerAppsQueries = {
  /**
   * MessengerApps list
   */
  async messengerApps(_root, { integrationId }: { integrationId: string }) {
    const apps = await MessengerApps.find({
      'credentials.integrationId': integrationId
    });

    const websites: IWebsite[] = [];
    const knowledgebases: ITopicDocument[] = [];
    const leads: IFormDocument[] = [];

    for (const app of apps) {
      const credentials: any = app.credentials;
      if (!credentials) {
        continue;
      }

      if (app.kind === 'website') {
        websites.push({
          description: credentials.description,
          buttonText: credentials.buttonText,
          url: credentials.url
        });
      }

      if (app.kind === 'knowledgebase') {
        const knowledgeBaseTopic = await KnowledgeBaseTopics.getTopic(
          credentials.topicId
        );
        knowledgebases.push(knowledgeBaseTopic);
      }

      if (app.kind === 'lead') {
        const form = await Forms.findOne({ code: credentials.formCode });

        if (form) {
          leads.push(form);
        }
      }
    }

    return { websites, knowledgebases, leads };
  }
};

export default messengerAppsQueries;
