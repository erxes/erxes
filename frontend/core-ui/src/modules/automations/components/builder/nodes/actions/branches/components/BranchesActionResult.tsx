import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { ActionResult } from 'ui-modules';

type TBranchesResult = { condition?: string };

export const BranchesActionResult = ({
  result,
}: ActionResultComponentProps<TBranchesResult>) => (
  <ActionResult.Status>
    {result?.condition
      ? `Condition: ${result.condition}`
      : 'No condition matched'}
  </ActionResult.Status>
);
