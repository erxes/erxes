import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';
import { lazy } from 'react';

const WebhooksComponents: AutomationComponentMap<AutomationNodeType.Action> = {
  outgoingWebhook: {
    sidebar: lazy(() =>
      import(
        '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookConfigForm'
      ).then((module) => ({
        default: module.OutgoingWebhookConfigForm,
      })),
    ),
    nodeContent: lazy(() =>
      import(
        '@/automations/components/builder/nodes/actions/webhooks/components/OutgoingWebhookNodeContent'
      ).then((module) => ({
        default: module.OutgoingWebhookNodeContent,
      })),
    ),
  },
};

export default WebhooksComponents;
