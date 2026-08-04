import { lazy } from 'react';
import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';

const MessageProComponents: AutomationComponentMap<AutomationNodeType.Action> =
  {
    messagePro: {
      sidebar: lazy(() =>
        import('@/automations/components/builder/nodes/actions/messagePro/components/MessageProConfigForm').then(
          (module) => ({
            default: module.MessageProConfigForm,
          }),
        ),
      ),
      nodeContent: lazy(() =>
        import('@/automations/components/builder/nodes/actions/messagePro/components/MessageProNodeContent').then(
          (module) => ({
            default: module.MessageProNodeContent,
          }),
        ),
      ),
    },
  };

export default MessageProComponents;
