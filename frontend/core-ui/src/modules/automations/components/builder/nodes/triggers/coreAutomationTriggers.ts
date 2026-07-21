import WebhooksComponents from '@/automations/components/builder/nodes/triggers/webhooks/Webhooks';
import { LazyAutomationComponent } from '@/automations/types';
import { lazy } from 'react';

const coreTriggers = {
  ...WebhooksComponents,
  schedules: {
    sidebar: lazy(() =>
      import(
        '@/automations/components/builder/nodes/triggers/schedules/ScheduleConfigForm'
      ).then((module) => ({ default: module.ScheduleConfigForm })),
    ),
    nodeContent: lazy(() =>
      import(
        '@/automations/components/builder/nodes/triggers/schedules/ScheduleNodeContent'
      ).then((module) => ({ default: module.ScheduleNodeContent })),
    ),
  },
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
