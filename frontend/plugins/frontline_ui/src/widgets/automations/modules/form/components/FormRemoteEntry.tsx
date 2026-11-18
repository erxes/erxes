import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryTypes,
  AutomationRemoteEntryWrapper,
  splitAutomationNodeType,
} from 'ui-modules';
import { CreateFormLinkActionConfig } from './action/CreateFormLinkActionConfig';
import { CreateFormLinkActionForm } from './action/CreateFormLinkActionForm';
import { FormHistoryName } from './FormHistoryName';
import { FormSubmittedTriggerForm } from './trigger/FormSubmittedTriggerForm';
import { FormSubmittedTriggerNodeContent } from './trigger/FormSubmittedTriggerNodeContent';

const FORM_SUBMISSION_COLLECTION = 'submissions';
const FORM_LINK_COLLECTION = 'links';

const isFormLinkAction = (type?: string) =>
  splitAutomationNodeType(type || '')[2] === FORM_LINK_COLLECTION;

export const FormRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        triggerForm: renderTriggerForm,
        triggerConfigContent: renderTriggerConfigContent,
        actionForm: renderActionForm,
        actionNodeConfiguration: renderActionNodeConfiguration,
        historyName: FormHistoryName,
      }}
    />
  );
};

function renderTriggerForm(props: AutomationRemoteEntryTypes['triggerForm']) {
  const [, , collectionType] = splitAutomationNodeType(
    props.activeTrigger?.type || '',
  );

  return collectionType === FORM_SUBMISSION_COLLECTION ? (
    <FormSubmittedTriggerForm {...props} />
  ) : null;
}

function renderTriggerConfigContent(
  props: AutomationRemoteEntryTypes['triggerConfigContent'],
) {
  const [, , collectionType] = splitAutomationNodeType(props.type || '');

  return collectionType === FORM_SUBMISSION_COLLECTION ? (
    <FormSubmittedTriggerNodeContent {...props} />
  ) : null;
}

function renderActionForm(props: AutomationRemoteEntryTypes['actionForm']) {
  return isFormLinkAction(props.currentAction?.type) ? (
    <CreateFormLinkActionForm {...props} />
  ) : null;
}

function renderActionNodeConfiguration(
  props: AutomationRemoteEntryTypes['actionNodeConfiguration'],
) {
  return isFormLinkAction(props.actionData?.type) ? (
    <CreateFormLinkActionConfig {...props} />
  ) : null;
}
