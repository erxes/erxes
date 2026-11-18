import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';
import { lazy } from 'react';

export const SendNotificationComponents: AutomationComponentMap<AutomationNodeType.Action> =
  {
    sendNotification: {
      sidebar: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/sendNotification/components/SendNotificationConfigForm'
        ).then((module) => ({
          default: module.SendNotificationConfigForm,
        })),
      ),
      nodeContent: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/sendNotification/components/SendNotificationNodeContent'
        ).then((module) => ({
          default: module.SendNotificationNodeContent,
        })),
      ),
    },
  };
