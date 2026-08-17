import { getTransformResultPreview } from '@/automations/components/builder/nodes/actions/transform/utils/transformResultPreview';
import { lazy } from 'react';
import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';

const TransformComponents: AutomationComponentMap<AutomationNodeType.Action> = {
  transform: {
    sidebar: lazy(() =>
      import(
        '@/automations/components/builder/nodes/actions/transform/components/TransformConfigForm'
      ).then((module) => ({
        default: module.TransformConfigForm,
      })),
    ),
    nodeContent: lazy(() =>
      import(
        '@/automations/components/builder/nodes/actions/transform/components/TransformNodeContent'
      ).then((module) => ({
        default: module.TransformNodeContent,
      })),
    ),
    actionResult: lazy(() =>
      import(
        '@/automations/components/builder/nodes/actions/transform/components/TransformActionResult'
      ).then((module) => ({
        default: module.TransformActionResult,
      })),
    ),
    actionResultPreview: getTransformResultPreview,
  },
};

export default TransformComponents;
