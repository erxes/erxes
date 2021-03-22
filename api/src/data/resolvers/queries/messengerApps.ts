import { MessengerApps } from '../../../db/models';

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
    const knowledgebases: string[] = [];
    const leads: string[] = [];

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
        knowledgebases.push(credentials.topicId);
      }

      if (app.kind === 'lead') {
        leads.push(credentials.formCode);
      }
    }

    return { websites, knowledgebases, leads };
  }
};

export default messengerAppsQueries;
