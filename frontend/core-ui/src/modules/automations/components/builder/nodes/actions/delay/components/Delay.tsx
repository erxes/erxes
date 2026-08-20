import { getDelayResultPreview } from '@/automations/components/builder/nodes/actions/delay/utils/delayResultPreview';
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
    actionResult: lazy(() =>
      import(
        '@/automations/components/builder/nodes/actions/delay/components/DelayActionResult'
      ).then((module) => ({
        default: module.DelayActionResult,
      })),
    ),
    actionResultPreview: getDelayResultPreview,
  },
};

export default DelayComponents;
