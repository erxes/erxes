import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('automations');

  if (result?.type === 'generateText') {
    return (
      <>
        <ActionResult.Status>
          {t('ai-agent-generated-text')}
        </ActionResult.Status>
        <ActionResult.Body title={t('ai-agent-generated-text')}>
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
        <ActionResult.Status>{t('ai-agent-classified')}</ActionResult.Status>
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
