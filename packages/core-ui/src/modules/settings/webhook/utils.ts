import { pluginsOfWebhooks } from 'pluginUtils';
import { WEBHOOK_ACTIONS } from '../constants';

export const getWebhookActions = () => {
  const { webhookActions } = pluginsOfWebhooks();

  return WEBHOOK_ACTIONS.concat(webhookActions);
};
