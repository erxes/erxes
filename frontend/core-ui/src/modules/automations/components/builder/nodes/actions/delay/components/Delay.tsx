import { lazy } from 'react';
import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';

const DelayComponents: AutomationComponentMap<AutomationNodeType.Action> = {
  delay: {
    sidebar: lazy(() =>
      import(
        '@/automations/components/builder/nodes/actions/delay/components/DelayConfigForm'
      ).then((module) => ({
        default: module.DelayConfigForm,
      })),
    ),
    nodeContent: lazy(() =>
      import(
        '@/automations/components/builder/nodes/actions/delay/components/DelayNodeContent'
      ).then((module) => ({
        default: module.DelayNodeContent,
      })),
    ),
    // actionResult:({action})=>`Delaying for: ${action.actionConfig.value} ${action.actionConfig.type}s`
  },
};

export default DelayComponents;
