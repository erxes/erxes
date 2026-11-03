import { lazy } from 'react';
import {
  AutomationExecutionHistoryNameProps,
  AutomationRemoteEntryProps,
  AutomationRemoteEntryTypes,
  AutomationRemoteEntryWrapper,
  splitAutomationNodeType,
} from 'ui-modules';
import { TICKET_STATUS_CHANGED_RELATION } from '../states/ticketStatusChangedTriggerForm';

type TTicketHistoryTarget = {
  name?: string;
  number?: string;
};

const TicketActionConfigForm = lazy(() =>
  import('./action/TicketActionConfigForm').then((module) => ({
    default: module.TicketActionConfigForm,
  })),
);

const TicketActionNodeContent = lazy(() =>
  import('./action/TicketActionNodeContent').then((module) => ({
    default: module.TicketActionNodeContent,
  })),
);
const TicketTemplateRequirement = lazy(() =>
  import('./template/TicketTemplateRequirement').then((module) => ({
    default: module.TicketTemplateRequirement,
  })),
);

const TicketStatusChangedTriggerForm = lazy(() =>
  import('./trigger/TicketStatusChangedTriggerForm').then((module) => ({
    default: module.TicketStatusChangedTriggerForm,
  })),
);

const TicketStatusChangedTriggerNodeContent = lazy(() =>
  import('./trigger/TicketStatusChangedTriggerNodeContent').then((module) => ({
    default: module.TicketStatusChangedTriggerNodeContent,
  })),
);

const isStatusChangedTrigger = (type?: string) =>
  splitAutomationNodeType(type)[3] === TICKET_STATUS_CHANGED_RELATION;

const CreateTicketActionResult = lazy(() =>
  import('./action/CreateTicketActionResult').then((module) => ({
    default: module.CreateTicketActionResult,
  })),
);

export const TicketRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        triggerForm: renderTriggerForm,
        triggerConfigContent: renderTriggerConfigContent,
        actionForm: TicketActionConfigForm,
        actionNodeConfiguration: TicketActionNodeContent,
        historyActionResult: CreateTicketActionResult,
        templateRequirement: TicketTemplateRequirement,
        historyName: ({
          target,
        }: AutomationExecutionHistoryNameProps<TTicketHistoryTarget>) =>
          target?.name || target?.number,
      }}
    />
  );
};

function renderTriggerForm(props: AutomationRemoteEntryTypes['triggerForm']) {
  return isStatusChangedTrigger(props.activeTrigger?.type) ? (
    <TicketStatusChangedTriggerForm {...props} />
  ) : null;
}

function renderTriggerConfigContent(
  props: AutomationRemoteEntryTypes['triggerConfigContent'],
) {
  return isStatusChangedTrigger(props.type) ? (
    <TicketStatusChangedTriggerNodeContent {...props} />
  ) : null;
}
