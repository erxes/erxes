import { getBranchesResultPreview } from '@/automations/components/builder/nodes/actions/branches/utils/branchesResultPreview';
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
    actionResult: lazy(() =>
      import(
        '@/automations/components/builder/nodes/actions/branches/components/BranchesActionResult'
      ).then((module) => ({
        default: module.BranchesActionResult,
      })),
    ),
    actionResultPreview: getBranchesResultPreview,
  },
};

export default BranchComponents;
