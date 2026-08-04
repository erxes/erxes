import { AiAgentComponents } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgent';
import BranchComponents from '@/automations/components/builder/nodes/actions/branches/components/Branches';
import DelayComponents from '@/automations/components/builder/nodes/actions/delay/components/Delay';
import FindObjectComponents from '@/automations/components/builder/nodes/actions/findObject/components/FindObject';
import ManagePropertiesComponents from '@/automations/components/builder/nodes/actions/manageProperties/components/ManageProperties';
import MessageProComponents from '@/automations/components/builder/nodes/actions/messagePro/components/MessagePro';
import SendEmailComponents from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmail';
import TransformComponents from '@/automations/components/builder/nodes/actions/transform/components/Transform';
import WaitEventComponents from '@/automations/components/builder/nodes/actions/waitEvent/components/WaitEvent';
import WebhooksComponents from '@/automations/components/builder/nodes/actions/webhooks/Webhooks';
import {
  CoreComponentReturn,
  TActionComponents,
  TAutomationActionComponent,
} from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import {
  AutomationComponentMap,
  AutomationNodeType,
} from '@/automations/types';
import SplitCondtionsComponents from '@/automations/components/builder/nodes/actions/split/components/SplitConditions';

const coreActions: AutomationComponentMap<AutomationNodeType.Action> = {
  ...DelayComponents,
  ...BranchComponents,
  ...ManagePropertiesComponents,
  ...TransformComponents,
  ...SendEmailComponents,
  ...MessageProComponents,
  ...WaitEventComponents,
  ...AiAgentComponents,
  ...WebhooksComponents,
  ...FindObjectComponents,
  ...SplitCondtionsComponents,
};

type ActionName = keyof typeof coreActions & string;

export function isCoreAutomationActionType(
  actionName: ActionName,
  componentType: TAutomationActionComponent,
): boolean {
  const action = coreActions[actionName];
  return action !== undefined && componentType in action;
}

export function getCoreAutomationActionComponent<
  N extends ActionName,
  T extends TAutomationActionComponent,
>(actionName: N, componentType: T): CoreComponentReturn<T> | null {
  if (isCoreAutomationActionType(actionName, componentType)) {
    const component =
      (coreActions[actionName] as TActionComponents)?.[componentType] ?? null;
    return component as CoreComponentReturn<T> | null;
  }
  return null;
}
