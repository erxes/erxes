import { lazy } from 'react';
import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';

const BranchComponents: AutomationComponentMap<AutomationNodeType.Action> = {
  if: {
    sidebar: lazy(() =>
      import(
        '@/automations/components/builder/nodes/actions/branches/components/BranchesConfigForm'
      ).then((module) => ({
        default: module.BranchesConfigForm,
      })),
    ),
  },
};

export default BranchComponents;
