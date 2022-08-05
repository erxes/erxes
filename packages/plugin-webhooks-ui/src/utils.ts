import { pluginsOfWebhooks } from 'coreui/pluginUtils';

export const getWebhookActions = actions => {
  const { webhookActions } = pluginsOfWebhooks();

  return actions.concat(webhookActions);
};
