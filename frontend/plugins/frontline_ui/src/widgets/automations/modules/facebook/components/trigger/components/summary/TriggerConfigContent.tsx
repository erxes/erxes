import { Separator } from 'erxes-ui';
import {
  AutomationTriggerConfigProps,
  splitAutomationNodeType,
} from 'ui-modules';
import { useTriggerConfigSummary } from '../../hooks/useTriggerConfigSummary';
import { TTriggerConfigContentConfig } from '../../types/triggerSummary';
import { TriggerBotProfile } from './TriggerBotProfile';
import { TriggerConditionSummary } from './TriggerConditionSummary';

export const TriggerConfigContent = ({
  config,
  type,
}: AutomationTriggerConfigProps<TTriggerConfigContentConfig>) => {
  const contentType = splitAutomationNodeType(type)[2];
  const { bot, loading, conditionSummaries } = useTriggerConfigSummary(
    config,
    contentType,
  );

  return (
    <div className="p-2">
      <TriggerBotProfile bot={bot} loading={loading} />
      <Separator />
      <TriggerConditionSummary conditionSummaries={conditionSummaries} />
    </div>
  );
};
