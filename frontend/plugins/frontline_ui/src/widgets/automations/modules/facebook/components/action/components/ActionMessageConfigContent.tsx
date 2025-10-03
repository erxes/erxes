import { IconChevronDown, IconLink } from '@tabler/icons-react';
import { Button, Collapsible, readImage } from 'erxes-ui';
import { Link } from 'react-router';
import { REPLY_MESSAGE_ACTION_BUTTONS } from '../constants/ReplyMessage';
import { TBotMessage } from '../states/replyMessageActionForm';
import { AutomationActionNodeConfigProps } from 'ui-modules';
import { TMessageTriggerForm } from '~/widgets/automations/modules/facebook/components/trigger/states/messageTriggerFormSchema';

export const ActionMessageConfigContent = ({
  config,
  trigger,
  OptionConnectHandle,
}: AutomationActionNodeConfigProps<
  { messages: TBotMessage[] },
  TMessageTriggerForm
>) => {
  const { messages = [] } = config || {};

  const { botId } = trigger?.config || {};

  return (
    <>
      {messages.map((message: TBotMessage) => (
        <ActionConfigMessage
          key={message._id}
          botId={botId}
          message={message}
          OptionConnectHandle={OptionConnectHandle}
        />
      ))}
    </>
  );
};

const ActionConfigMessage = ({
  botId,
  message,
  OptionConnectHandle,
}: {
  botId?: string;
  message: TBotMessage;
  OptionConnectHandle?:
    | (({ optionalId }: { optionalId: string }) => React.ReactNode)
    | null;
}) => {
  const { _id, type, text, cards = [], buttons, quickReplies, input } = message;
  switch (type) {
    case 'text':
      return (
        <ActionConfigMessageCard
          _id={_id}
          type={type}
          text={text}
          buttons={buttons}
          OptionConnectHandle={OptionConnectHandle}
        />
      );
    case 'card':
      return cards.map((card) => (
        <ActionConfigMessageCard
          key={card._id}
          type={type}
          {...card}
          OptionConnectHandle={OptionConnectHandle}
        />
      ));
    case 'quickReplies':
      return (
        <ActionConfigMessageCard
          _id={_id}
          type={type}
          text={text}
          buttons={quickReplies}
          OptionConnectHandle={OptionConnectHandle}
        />
      );
    // case 'image':
    //   return renderCard({ image });
    // case 'video':
    //   return renderCard({ video });
    // case 'audio':
    //   return renderCard({ audio });
    // case 'attachments':
    //   return renderCard({ attachments });
    case 'input':
      if (!botId) {
        return (
          <ActionConfigMessageCard
            _id={_id}
            type={type}
            text="This action must be part of a chain that starts with a trigger"
          />
        );
      }
      return (
        <ActionConfigMessageCard
          _id={_id}
          type={type}
          text={input?.text}
          subtitle={`Input expires in: ${input?.value || 0} ${
            input?.type || ''
          }`}
          buttons={[
            { _id: botId, text: 'If Reply' },
            { _id: 'ifNotReply', text: 'If Not Reply' },
          ]}
          OptionConnectHandle={OptionConnectHandle}
        />
      );

    default:
      return null;
  }
};

const ActionConfigMessageCard = ({
  _id,
  type,
  text = '',
  title = '',
  subtitle = '',
  buttons = [],
  // image = '',
  // audio = '',
  // video = '',
  // attachments = [],
  OptionConnectHandle,
}: {
  _id: string;
  type: string;
  text?: string;
  title?: string;
  subtitle?: string;
  buttons?: any[];
  image?: string;
  audio?: string;
  video?: string;
  attachments?: any[];
  OptionConnectHandle?:
    | (({ optionalId }: { optionalId: string }) => React.ReactNode)
    | null;
}) => {
  const { title: actionButtonTitle, icon: ActionButtonIcon } =
    REPLY_MESSAGE_ACTION_BUTTONS.find(
      ({ type: btnType }) => btnType === type,
    ) || {};

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Collapsible onClick={(e) => e.stopPropagation()}>
        <Collapsible.Trigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-2 items-center">
              {ActionButtonIcon && <ActionButtonIcon />}
              {actionButtonTitle}
            </div>
            <IconChevronDown />
          </Button>
        </Collapsible.Trigger>
        <Collapsible.Content className="px-6">
          <p>{text || title}</p>
          <span>{subtitle}</span>
        </Collapsible.Content>
      </Collapsible>
      {buttons.map(({ _id, text, link, image_url }, index) => (
        <div
          key={`${_id}-right`}
          className="relative bg-background shadow text-xs font-semibold rounded-xs m-2 p-2 text-mono"
        >
          {image_url ? (
            <img
              className="w-6 h-6 rounded-full mr-2"
              src={readImage(image_url)}
              alt={image_url}
            />
          ) : null}
          {text}
          {link ? (
            <Link to={link} target="_blank">
              <IconLink />
            </Link>
          ) : (
            OptionConnectHandle && <OptionConnectHandle optionalId={_id} />
          )}
        </div>
      ))}
    </div>
  );
};
