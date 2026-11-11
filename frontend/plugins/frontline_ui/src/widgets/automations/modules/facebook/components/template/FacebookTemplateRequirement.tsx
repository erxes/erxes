import {
  AutomationTemplateRequirementProps,
  splitAutomationNodeType,
} from 'ui-modules';
import { FacebookBotSelector } from '~/widgets/automations/modules/facebook/components/MessengerBotSelector';

/**
 * Answers a template's `frontline:facebook.bot`: the page bot its Messenger
 * trigger listens to. The answer is the bot id, the trigger's `botId`.
 */
export const FacebookTemplateRequirement = ({
  kind,
  value,
  onChange,
}: AutomationTemplateRequirementProps) => {
  // `frontline:facebook.<what>`
  const [, , what] = splitAutomationNodeType(kind);

  if (what !== 'bot') {
    return null;
  }

  return (
    <div className="rounded-lg border">
      <FacebookBotSelector
        botId={typeof value === 'string' ? value : undefined}
        onSelect={(botId) => onChange(botId || null)}
      />
    </div>
  );
};
