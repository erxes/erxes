import { Forms, MessengerApps } from '../../../db/models';
import { putDeleteLog } from '../../logUtils';
import { requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

const messengerAppMutations = {
  async messengerAppsAddKnowledgebase(_root, params, { docModifier }: IContext) {
    const { name, integrationId, topicId } = params;

    return MessengerApps.createApp(
      docModifier({
        name,
        kind: 'knowledgebase',
        showInInbox: false,
        credentials: {
          integrationId,
          topicId,
        },
      }),
    );
  },

  async messengerAppsAddWebsite(_root, params, { docModifier }: IContext) {
    const { name, integrationId, description, buttonText, url } = params;

    return MessengerApps.createApp(
      docModifier({
        name,
        kind: 'website',
        showInInbox: false,
        credentials: {
          integrationId,
          description,
          buttonText,
          url,
        },
      }),
    );
  },

  /**
   * Creates a messenger app lead
   * @param {string} params.name Name
   * @param {string} params.integrationId Integration
   * @param {string} params.formId Form
   */
  async messengerAppsAddLead(_root, params, { docModifier }: IContext) {
    const { name, integrationId, formId } = params;
    const form = await Forms.getForm(formId);

    const lead = await MessengerApps.createApp(
      docModifier({
        name,
        kind: 'lead',
        showInInbox: false,
        credentials: {
          integrationId,
          formCode: form.code,
        },
      }),
    );

    return lead;
  },

  /*
   * Remove app
   */
  async messengerAppsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const messengerApp = await MessengerApps.getApp(_id);
    const removed = await MessengerApps.deleteOne({ _id });

    await putDeleteLog(
      {
        type: 'messengerApp',
        object: messengerApp,
        description: `${messengerApp.name} has been removed`,
      },
      user,
    );

    return removed;
  },
};

requireLogin(messengerAppMutations, 'messengerAppsAddKnowledgebase');
requireLogin(messengerAppMutations, 'messengerAppsAddWebsite');
requireLogin(messengerAppMutations, 'messengerAppsAddLead');

export default messengerAppMutations;
