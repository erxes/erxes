import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';
import { lazy } from 'react';

export const PickMemberComponents: AutomationComponentMap<AutomationNodeType.Action> =
  {
    pickMember: {
      sidebar: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/pickMember/components/PickMemberConfigForm'
        ).then((module) => ({
          default: module.PickMemberConfigForm,
        })),
      ),
      nodeContent: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/pickMember/components/PickMemberNodeContent'
        ).then((module) => ({
          default: module.PickMemberNodeContent,
        })),
      ),
    },
  };
