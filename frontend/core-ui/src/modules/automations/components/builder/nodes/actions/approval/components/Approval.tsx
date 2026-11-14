import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';
import { lazy } from 'react';

export const ApprovalComponents: AutomationComponentMap<AutomationNodeType.Action> =
  {
    approval: {
      sidebar: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/approval/components/ApprovalConfigForm'
        ).then((module) => ({
          default: module.ApprovalConfigForm,
        })),
      ),
      nodeContent: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/approval/components/ApprovalNodeContent'
        ).then((module) => ({
          default: module.ApprovalNodeContent,
        })),
      ),
    },
  };
