import { MessengerApps } from '../../models';
import { requireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '@erxes/api-utils/src';

const messengerAppMutations = {
  async messengerAppSave(
    _root,
    {
      integrationId,
      messengerApps
    }: { integrationId: string; messengerApps: any },
    { docModifier }: IContext
  ) {
    await MessengerApps.deleteMany({
      'credentials.integrationId': integrationId
    });

    if (messengerApps.websites) {
      for (const website of messengerApps.websites) {
        const doc = {
          kind: 'website',
          credentials: {
            integrationId,
            description: website.description,
            buttonText: website.buttonText,
            url: website.url
          }
        };

        await MessengerApps.createApp(docModifier(doc));
      }
    }

    if (messengerApps.knowledgebases) {
      for (const knowledgebase of messengerApps.knowledgebases) {
        const doc = {
          kind: 'knowledgebase',
          credentials: {
            integrationId,
            topicId: knowledgebase.topicId
          }
        };

        await MessengerApps.createApp(docModifier(doc));
      }
    }

    if (messengerApps.leads) {
      for (const lead of messengerApps.leads) {
        const doc = {
          kind: 'lead',
          credentials: {
            integrationId,
            formCode: lead.formCode
          }
        };

        await MessengerApps.createApp(docModifier(doc));
      }
    }

    return 'success';
  }
};

requireLogin(messengerAppMutations, 'messengerAppSave');

export default messengerAppMutations;