import { useTranslation } from 'react-i18next';
import {
  TBotMessage,
  TMessageActionForm,
} from '../../states/replyMessageActionForm';
import { AutomationActionNodeConfigProps, TAutomationAction } from 'ui-modules';
import { TMessageTriggerForm } from '~/widgets/automations/modules/facebook/components/trigger/types/messageTrigger';
import { ActionMessageCard } from './ActionMessageCard';

export const ActionMessageConfigContent = ({
  config,
  trigger,
  actionData,
}: AutomationActionNodeConfigProps<
  TMessageActionForm,
  TMessageTriggerForm
>) => {
  const { messages = [] } = config || {};

  const { botId } = trigger?.config || {};

  return (
    <>
      {messages.map((message: TBotMessage) => (
        <ActionConfigMessage
          actionData={actionData}
          key={message._id}
          botId={botId}
          message={message}
        />
      ))}
    </>
  );
};

const ActionConfigMessage = ({
  botId,
  message,
  actionData,
}: {
  botId?: string;
  message: TBotMessage;
  actionData: TAutomationAction<TMessageActionForm>;
}) => {
  const { t } = useTranslation('frontline');
  const { _id, type } = message;
  switch (type) {
    case 'text':
      return (
        <ActionMessageCard
          _id={_id}
          type={type}
          text={message.text}
          buttons={message.buttons}
          actionData={actionData}
        />
      );
    case 'card':
      return (message?.cards || []).map((card) => (
        <ActionMessageCard
          key={card._id}
          type={type}
          actionData={actionData}
          _id={card._id}
          title={card.title}
          subtitle={card.subtitle}
          buttons={card.buttons}
        />
      ));
    case 'quickReplies':
      return (
        <ActionMessageCard
          _id={_id}
          type={type}
          actionData={actionData}
          text={message.text}
          buttons={message.quickReplies}
        />
      );
    case 'image':
      return (
        <ActionMessageCard
          _id={_id}
          type={type}
          actionData={actionData}
          text="Image attachment"
          subtitle={message.image}
        />
      );
    case 'video':
      return (
        <ActionMessageCard
          _id={_id}
          type={type}
          actionData={actionData}
          text="Video attachment"
          subtitle={message.video}
        />
      );
    case 'audio':
      return (
        <ActionMessageCard
          _id={_id}
          type={type}
          actionData={actionData}
          text="Audio attachment"
          subtitle={message.audio}
        />
      );
    case 'attachments':
      return (message.attachments || []).map((attachment) => (
        <ActionMessageCard
          key={attachment._id}
          _id={attachment._id}
          type={type}
          actionData={actionData}
          text="File attachment"
          subtitle={attachment.url}
        />
      ));
    case 'input':
      if (!botId) {
        return (
          <ActionMessageCard
            _id={_id}
            type={type}
            actionData={actionData}
            text={t('action-requires-trigger')}
          />
        );
      }
      return (
        <ActionMessageCard
          _id={_id}
          type={type}
          actionData={actionData}
          text={message.input?.text}
          subtitle={`Input expires in: ${message.input?.value || 0} ${
            message.input?.type || ''
          }`}
          buttons={[
            { _id: botId, text: t('if-reply') },
            { _id: 'ifNotReply', text: t('if-not-reply') },
          ]}
        />
      );

    default:
      return null;
  }
};
