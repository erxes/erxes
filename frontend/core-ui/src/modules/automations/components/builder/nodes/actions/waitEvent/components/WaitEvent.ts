import { lazy } from 'react';
import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';

const WaitEventComponents: AutomationComponentMap<AutomationNodeType.Action> = {
  waitEvent: {
    sidebar: lazy(() =>
      import(
        '@/automations/components/builder/nodes/actions/waitEvent/components/WaitEventConfigForm'
      ).then((module) => ({
        default: module.WaitEventConfigForm,
      })),
    ),
    nodeContent: lazy(() =>
      import(
        '@/automations/components/builder/nodes/actions/waitEvent/components/WaitEventNodeContent'
      ).then((module) => ({
        default: module.WaitEventNodeContent,
      })),
    ),
  },
};

export default WaitEventComponents;
