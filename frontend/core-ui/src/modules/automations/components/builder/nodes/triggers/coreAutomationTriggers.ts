import WebhooksComponents from '@/automations/components/builder/nodes/triggers/webhooks/Webhooks';
import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';
import { lazy } from 'react';

const coreTriggers: AutomationComponentMap<AutomationNodeType.Trigger> = {
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

export function isCoreAutomationTriggerType(
  triggerName: TriggerName,
  componentType: TAutomationTriggerComponent,
): boolean {
  const trigger = coreTriggers[triggerName];
  return trigger !== undefined && componentType in trigger;
}

export function getCoreAutomationTriggerComponent<
  T extends TAutomationTriggerComponent,
>(triggerName: TriggerName, componentType: T) {
  if (isCoreAutomationTriggerType(triggerName, componentType)) {
    return coreTriggers[triggerName]?.[componentType] ?? null;
  }
  return null;
}
