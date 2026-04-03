import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';
import { lazy } from 'react';

const WebhooksComponents: AutomationComponentMap<AutomationNodeType.Trigger> = {
  incoming_webhook: {
    sidebar: lazy(() =>
      import(
        '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookConfigForm'
      ).then((module) => ({
        default: module.IncomingWebhookConfigForm,
      })),
    ),
    nodeContent: lazy(() =>
      import(
        '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookNodeContent'
      ).then((module) => ({
        default: module.IncomingWebhookNodeContent,
      })),
    ),
  },
};

export default WebhooksComponents;
