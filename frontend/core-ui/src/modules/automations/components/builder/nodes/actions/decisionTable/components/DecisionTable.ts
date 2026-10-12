import { getDecisionTableResultPreview } from '@/automations/components/builder/nodes/actions/decisionTable/utils/decisionTableResultPreview';
import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';
import { lazy } from 'react';

export const DecisionTableComponents: AutomationComponentMap<AutomationNodeType.Action> =
  {
    decisionTable: {
      sidebar: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableConfigForm'
        ).then((module) => ({
          default: module.DecisionTableConfigForm,
        })),
      ),
      nodeContent: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableNodeContent'
        ).then((module) => ({
          default: module.DecisionTableNodeContent,
        })),
      ),
      actionResult: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableActionResult'
        ).then((module) => ({
          default: module.DecisionTableActionResult,
        })),
      ),
      actionResultPreview: getDecisionTableResultPreview,
    },
  };
