import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryTypes,
  AutomationRemoteEntryWrapper,
  splitAutomationNodeType,
} from 'ui-modules';
import { MailDraftActionForm } from './action/MailDraftActionForm';
import { MailSendActionForm } from './action/MailSendActionForm';
import { MailTriggerForm } from './trigger/MailTriggerForm';

export const MailRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        actionForm: renderActionForm,
        triggerForm: renderTriggerForm,
      }}
    />
  );
};

function renderActionForm(props: AutomationRemoteEntryTypes['actionForm']) {
  const [, , contentType] = splitAutomationNodeType(
    props.currentAction?.type || '',
  );

  if (contentType === 'messages') {
    return <MailSendActionForm {...props} />;
  }

  if (contentType === 'drafts') {
    return <MailDraftActionForm {...props} />;
  }

  return null;
}

function renderTriggerForm(props: AutomationRemoteEntryTypes['triggerForm']) {
  const [, , contentType] = splitAutomationNodeType(
    props.activeTrigger?.type || '',
  );

  return contentType === 'messages' ? <MailTriggerForm {...props} /> : null;
}
