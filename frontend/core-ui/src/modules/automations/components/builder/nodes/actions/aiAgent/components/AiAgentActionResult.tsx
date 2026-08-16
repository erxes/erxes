import { stringifyAutomationHistoryValue } from '@/automations/components/builder/history/components/AutomationHistoryPopoverValue';
import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { ActionResult } from 'ui-modules';

type TAiAgentResult = {
  type?: 'generateText' | 'splitTopic' | 'classification';
  text?: string;
  topicId?: string;
  attributes?: Record<string, unknown>;
};

const getAiAgentSummary = (result?: TAiAgentResult) => {
  if (result?.type === 'generateText') {
    return result.text || 'Generated text';
  }

  if (result?.type === 'splitTopic') {
    return result.topicId
      ? `Matched topic: ${result.topicId}`
      : 'No matching topic';
  }

  if (result?.type === 'classification') {
    return stringifyAutomationHistoryValue(result.attributes || {});
  }

  return stringifyAutomationHistoryValue(result);
};

export const AiAgentActionResult = ({
  result,
}: ActionResultComponentProps<TAiAgentResult>) => {
  if (result?.type === 'generateText') {
    return (
      <>
        <ActionResult.Status>Generated text</ActionResult.Status>
        <ActionResult.Body title="Generated text">
          <p className="whitespace-pre-wrap break-words text-xs">
            {result.text}
          </p>
        </ActionResult.Body>
      </>
    );
  }

  if (result?.type === 'classification') {
    return (
      <>
        <ActionResult.Status>Classified</ActionResult.Status>
        <ActionResult.Fields>
          {Object.entries(result.attributes || {}).map(([key, value]) => (
            <ActionResult.Field
              key={key}
              label={key}
              value={stringifyAutomationHistoryValue(value)}
            />
          ))}
        </ActionResult.Fields>
      </>
    );
  }

  return <ActionResult.Status>{getAiAgentSummary(result)}</ActionResult.Status>;
};
