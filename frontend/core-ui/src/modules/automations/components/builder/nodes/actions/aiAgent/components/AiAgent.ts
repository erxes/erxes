import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';
import { lazy } from 'react';

const AiAgentComponents: AutomationComponentMap<AutomationNodeType.Action> = {
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
  },
};

export default AiAgentComponents;
