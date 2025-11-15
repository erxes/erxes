import WebhooksComponents from '@/automations/components/builder/nodes/triggers/webhooks/Webhooks';
import { LazyAutomationComponent } from '@/automations/types';

const coreTriggers = {
  ...WebhooksComponents,
};

type TriggerName = keyof typeof coreTriggers;
export enum TAutomationTriggerComponent {
  Sidebar = 'sidebar',
  NodeContent = 'nodeContent',
}
type TriggerComponents = {
  sidebar?: LazyAutomationComponent<any>;
  nodeContent?: LazyAutomationComponent<any>;
};

export function isCoreAutomationTriggerType(
  triggerName: TriggerName,
  componentType: TAutomationTriggerComponent,
): boolean {
  const trigger = coreTriggers[triggerName];
  return trigger !== undefined && componentType in trigger;
}

// // Alternative version that returns the component if it exists
export function getCoreAutomationTriggerComponent(
  triggerName: TriggerName,
  componentType: TAutomationTriggerComponent,
): React.LazyExoticComponent<React.ComponentType<any>> | null {
  if (isCoreAutomationTriggerType(triggerName, componentType)) {
    return (
      (coreTriggers[triggerName] as TriggerComponents)?.[componentType] ?? null
    );
  }
  return null;
}
