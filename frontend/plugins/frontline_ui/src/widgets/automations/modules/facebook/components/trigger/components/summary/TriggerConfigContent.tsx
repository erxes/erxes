import { Separator } from 'erxes-ui';
import { AutomationTriggerConfigProps } from 'ui-modules';
import { useTriggerConfigSummary } from '../../hooks/useTriggerConfigSummary';
import { TTriggerConfigContentConfig } from '../../types/triggerSummary';
import { TriggerBotProfile } from './TriggerBotProfile';
import { TriggerConditionSummary } from './TriggerConditionSummary';

export const TriggerConfigContent = ({
  config,
}: AutomationTriggerConfigProps<TTriggerConfigContentConfig>) => {
  const { bot, loading, conditionSummaries } = useTriggerConfigSummary(config);

  return (
    <div className="p-2">
      <TriggerBotProfile bot={bot} loading={loading} />
      <Separator />
      <TriggerConditionSummary conditionSummaries={conditionSummaries} />
    </div>
  );
};
