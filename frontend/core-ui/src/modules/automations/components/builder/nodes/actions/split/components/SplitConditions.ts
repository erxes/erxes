import { lazy } from 'react';
import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';

const SplitCondtionsComponents: AutomationComponentMap<AutomationNodeType.Action> =
  {
    split: {
      sidebar: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/split/components/SplitConditionsConfigForm'
        ).then((module) => ({
          default: module.SplitConditionsConfigForm,
        })),
      ),
      nodeContent: lazy(() =>
        import(
          '@/automations/components/builder/nodes/actions/split/components/SplitConditionsNodeConfig'
        ).then((module) => ({
          default: module.SplitConditionsNodeConfig,
        })),
      ),
    },
  };

export default SplitCondtionsComponents;
