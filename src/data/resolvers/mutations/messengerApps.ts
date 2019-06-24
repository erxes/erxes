import { Forms, MessengerApps } from '../../../db/models';
import { requireLogin } from '../../permissions/wrappers';

const messengerAppMutations = {
  /*
   * Knowledgebase
   */
  async messengerAppsAddKnowledgebase(
    _root,
    { name, integrationId, topicId }: { name: string; integrationId: string; topicId: string },
  ) {
    return MessengerApps.createApp({
      name,
      kind: 'knowledgebase',
      showInInbox: false,
      credentials: {
        integrationId,
        topicId,
      },
    });
  },

  /*
   * Lead
   */
  async messengerAppsAddLead(
    _root,
    { name, integrationId, formId }: { name: string; integrationId: string; formId: string },
  ) {
    const form = await Forms.findOne({ _id: formId });

    if (!form) {
      throw new Error('Form not found');
    }

    return MessengerApps.createApp({
      name,
      kind: 'lead',
      showInInbox: false,
      credentials: {
        integrationId,
        formCode: form.code || '',
      },
    });
  },

  /*
   * Remove app
   */
  async messengerAppsRemove(_root, { _id }: { _id: string }) {
    return MessengerApps.deleteOne({ _id });
  },
};

requireLogin(messengerAppMutations, 'messengerAppsAddKnowledgebase');
requireLogin(messengerAppMutations, 'messengerAppsAddLead');

export default messengerAppMutations;
