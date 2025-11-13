import { lazy } from 'react';
import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';

const FindObjectComponents: AutomationComponentMap<AutomationNodeType.Action> =
  {
    findObject: {
      sidebar: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/findObject/components/FindObjectConfigForm'
        ).then((module) => ({
          default: module.FindObjectConfigForm,
        })),
      ),
      nodeContent: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/findObject/components/FindObjectNodeContent'
        ).then((module) => ({
          default: module.FindObjectNodeContent,
        })),
      ),
    },
  };

export default FindObjectComponents;
