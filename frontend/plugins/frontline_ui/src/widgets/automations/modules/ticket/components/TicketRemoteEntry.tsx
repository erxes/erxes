import { lazy } from 'react';
import {
  AutomationExecutionHistoryNameProps,
  AutomationRemoteEntryProps,
  AutomationRemoteEntryWrapper,
} from 'ui-modules';

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
