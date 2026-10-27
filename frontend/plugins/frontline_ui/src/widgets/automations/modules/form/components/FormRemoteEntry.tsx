import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryTypes,
  AutomationRemoteEntryWrapper,
  splitAutomationNodeType,
} from 'ui-modules';
import { FormHistoryName } from './FormHistoryName';
import { FormSubmittedTriggerForm } from './trigger/FormSubmittedTriggerForm';
import { FormSubmittedTriggerNodeContent } from './trigger/FormSubmittedTriggerNodeContent';

const FORM_SUBMISSION_COLLECTION = 'submissions';

export const FormRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        triggerForm: renderTriggerForm,
        triggerConfigContent: renderTriggerConfigContent,
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
