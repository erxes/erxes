import { pluginsOfWebhooks } from '@erxes/ui/src/pluginUtils';
import { WEBHOOK_ACTIONS } from '@erxes/ui-settings/src/constants';

export const getWebhookActions = () => {
  const { webhookActions } = pluginsOfWebhooks();

  return WEBHOOK_ACTIONS.concat(webhookActions);
};
