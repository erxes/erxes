import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryTypes,
  AutomationRemoteEntryWrapper,
  splitAutomationNodeType,
} from 'ui-modules';
import { ActionMessageConfigContent } from './action/components/replyMessage/ActionMessageConfigContent';
import { MessageActionForm } from './action/components/replyMessage/MessageActionForm';
import { MessageTriggerForm } from './trigger/components/MessageTriggerForm';
import { TriggerConfigContent } from './trigger/components/TriggerConfigContent';
import { AutomationBotsRecordTable } from './bots/components/automationBotsRecordTable';
import { AutomationHistoryName } from '~/widgets/automations/modules/facebook/components/AutomationHistoryName';
import { AutomationHistoryResult } from '~/widgets/automations/modules/facebook/components/AutomationHistoryResult';
import { CommentTriggerForm } from '~/widgets/automations/modules/facebook/components/trigger/components/CommentTriggerForm';
import { CommentActionForm } from '~/widgets/automations/modules/facebook/components/action/components/replyComment/CommentActionForm';
import { ActionCommentConfigContent } from '~/widgets/automations/modules/facebook/components/action/components/replyComment/ActionCommentConfigContent';

export const FacebookRemoteEntry = (props: AutomationRemoteEntryProps) => {
  const { componentType = '' } = props;

  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        actionForm: renderActionForm,
        triggerForm: renderTriggerForm,
        triggerConfigContent: TriggerConfigContent,
        actionNodeConfiguration: renderActionNodeContent,
        automationBotsContent: AutomationBotsRecordTable,
        historyName: AutomationHistoryName,
        historyActionResult: AutomationHistoryResult,
      }}
    />
  );

  switch (componentType) {
    case 'actionForm':
      return renderActionForm(
        props as AutomationRemoteEntryTypes['actionForm'],
      );

    case 'triggerForm':
      return renderTriggerForm(
        props as AutomationRemoteEntryTypes['triggerForm'],
      );

    case 'triggerConfigContent':
      return (
        <TriggerConfigContent
          {...(props as AutomationRemoteEntryTypes['triggerConfigContent'])}
        />
      );

    case 'actionNodeConfiguration':
      return renderActionNodeContent(
        props as AutomationRemoteEntryTypes['actionNodeConfiguration'],
      );
    case 'automationBotsContent':
      return <AutomationBotsRecordTable />;
    case 'historyName':
      return (
        <AutomationHistoryName
          {...(props as AutomationRemoteEntryTypes['historyName'])}
        />
      );
    case 'historyActionResult':
      return (
        <AutomationHistoryResult
          {...(props as AutomationRemoteEntryTypes['historyActionResult'])}
        />
      );

    default:
      return null;
  }
};

function renderActionNodeContent(
  props: AutomationRemoteEntryTypes['actionNodeConfiguration'],
) {
  const actionType = props?.type || '';
  const [_pluginName, _moduleName, contentType] =
    splitAutomationNodeType(actionType);

  switch (contentType) {
    case 'messages':
      return <ActionMessageConfigContent {...props} />;
    case 'comments':
      return <ActionCommentConfigContent {...props} />;
    default:
      return null;
  }
}

function renderActionForm(props: AutomationRemoteEntryTypes['actionForm']) {
  const actionType = props.currentAction?.type || '';
  const [_pluginName, _moduleName, contentType] =
    splitAutomationNodeType(actionType);

  switch (contentType) {
    case 'messages':
      return <MessageActionForm {...props} />;
    case 'comments':
      return <CommentActionForm {...props} />;
    default:
      return null;
  }
}

function renderTriggerForm(props: AutomationRemoteEntryTypes['triggerForm']) {
  const triggerType = props.activeTrigger?.type || '';
  const [_pluginName, _moduleName, contentType] =
    splitAutomationNodeType(triggerType);

  switch (contentType) {
    case 'messages':
      return <MessageTriggerForm {...props} />;
    case 'comments':
      return <CommentTriggerForm {...props} />;
    default:
      return null;
  }
}
