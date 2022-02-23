import { pluginsOfWebhooks } from '@erxes/ui/src/pluginUtils';
import { WEBHOOK_ACTIONS } from '../constants';

export const getWebhookActions = () => {
  const { webhookActions } = pluginsOfWebhooks();

  return WEBHOOK_ACTIONS.concat(webhookActions);
};
