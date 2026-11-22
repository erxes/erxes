import { type AutomationDefinition, appEventType } from '@erxes/core-contract';

export const triggerKey = ({ trigger }: Pick<AutomationDefinition, 'trigger'>) => {
  if (trigger.kind === 'event') return trigger.event;

  return trigger.kind === 'app' ? appEventType(trigger.app, trigger.trigger) : `${trigger.kind}:`;
};
