import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { getActionResultErrorText } from '@/automations/utils/automationHistoryUtils/executionResultPreview';
import { ActionResult } from 'ui-modules';

type TBranchesResult = { condition?: string; error?: unknown };

const getConditionText = (result?: TBranchesResult) =>
  result?.condition ? `Condition: ${result.condition}` : 'No condition matched';

export const BranchesActionResult = ({
  result,
}: ActionResultComponentProps<TBranchesResult>) =>
  result?.error ? (
    <ActionResult.Status status="error">
      {getActionResultErrorText(result.error)}
    </ActionResult.Status>
  ) : (
    <ActionResult.Status>{getConditionText(result)}</ActionResult.Status>
  );
