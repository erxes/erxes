import { AutomationNodeType } from '@/automations/types';
import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import { TTemplate, TTemplateRequirement } from '@/template/types';

/**
 * What a requirement's own answer can reference while it is being written,
 * e.g. an email step's `{{ trigger.* }}`: the trigger of the journey its
 * first `step`/`trigger`/`workflow` fill names. A `part` fill names none, so
 * a requirement that only fills parts offers nothing here.
 */
export const templateRequirementSourceNodes = (
  template: Pick<TTemplate, 'journeys'> | undefined,
  requirement: Pick<TTemplateRequirement, 'fills'>,
): TAutomationVariableSourceNode[] => {
  const journeyKey = requirement.fills?.find((fill) => fill.journey)?.journey;
  const journey = template?.journeys.find(({ key }) => key === journeyKey);

  if (!journey) {
    return [];
  }

  return [
    {
      id: 'trigger',
      type: journey.triggerType,
      nodeType: AutomationNodeType.Trigger,
      label: journey.name,
    },
  ];
};
