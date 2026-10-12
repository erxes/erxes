import { TDecisionTableActionResult } from '@/automations/components/builder/nodes/actions/decisionTable/utils/decisionTableResultPreview';
import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { getActionResultErrorText } from '@/automations/utils/automationHistoryUtils/executionResultPreview';
import { ActionResult } from 'ui-modules';

const formatValue = (value: unknown) =>
  typeof value === 'object' && value !== null
    ? JSON.stringify(value)
    : String(value ?? '');

export const DecisionTableActionResult = ({
  result,
}: ActionResultComponentProps<TDecisionTableActionResult>) => {
  if (result?.error) {
    return (
      <ActionResult.Status status="error">
        {getActionResultErrorText(result.error)}
      </ActionResult.Status>
    );
  }

  const emptyInputs = result?.emptyInputs || [];

  return (
    <>
      <ActionResult.Status>
        {result?.matched
          ? `Row ${result.matchedRow} matched`
          : 'No row matched; default values used'}
      </ActionResult.Status>
      <ActionResult.Fields>
        {Object.entries(result?.data || {}).map(([key, value]) => (
          <ActionResult.Field
            key={key}
            label={key}
            value={formatValue(value)}
          />
        ))}
        {emptyInputs.length > 0 && (
          <ActionResult.Field
            label="Empty inputs"
            value={emptyInputs.join(', ')}
          />
        )}
      </ActionResult.Fields>
      {result?.inputs && (
        <ActionResult.Body title="Inputs">
          <ActionResult.Json value={result.inputs} />
        </ActionResult.Body>
      )}
    </>
  );
};
