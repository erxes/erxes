import { pluginsOfWebhooks } from '@erxes/ui/src/pluginUtils';

export const getWebhookActions = (actions) => {
  const { webhookActions } = pluginsOfWebhooks();

  return actions.concat(webhookActions);
};
