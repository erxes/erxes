import { getAiAgentResultPreview } from '@/automations/components/builder/nodes/actions/aiAgent/utils/aiAgentResultPreview';
import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';
import { lazy } from 'react';

export const AiAgentComponents: AutomationComponentMap<AutomationNodeType.Action> =
  {
    aiAgent: {
      sidebar: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentConfigForm'
        ).then((module) => ({
          default: module.AIAgentConfigForm,
        })),
      ),
      nodeContent: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentNodeContent'
        ).then((module) => ({
          default: module.AiAgentNodeContent,
        })),
      ),
      actionResult: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentActionResult'
        ).then((module) => ({
          default: module.AiAgentActionResult,
        })),
      ),
      actionResultPreview: getAiAgentResultPreview,
    },
  };
