import { FacebookInputMessage } from '~/widgets/automations/modules/facebook/components/action/components/replyMessage/FacebookInputMessage';
import { TBotMessage } from '../../states/replyMessageActionForm';
import { FacebookCardsMessage } from './FacebookCardsMessage';
import { FacebookMediaMessage } from './FacebookMediaMessage';
import { FacebookQuickRepliesMessage } from './FacebookQuickRepliesMessage';
import { FacebookTextMessage } from './FacebookTextMessage';
import { FacebookTicketFormMessage } from './FacebookTicketFormMessage';
import { FacebookMessageProps } from '~/widgets/automations/modules/facebook/components/action/types/messageActionForm';
import { FieldPath } from 'react-hook-form';

type MessageComponents = {
  [M in TBotMessage as M['type']]: React.ComponentType<{
    index: number;
    message: M;
    handleMessageChange: (
      messageIndex: number,
      field: FieldPath<M>,
      newData: any,
    ) => void;
  }>;
};
export const FacebookMessageContent = ({
  index,
  message,
  handleMessageChange,
}: {
  index: number;
  message: TBotMessage;
  handleMessageChange: (
    messageIndex: number,
    field: FieldPath<TBotMessage>,
    newData: any,
  ) => void;
}) => {
  const updatedProps = {
    index,
    message,
    handleMessageChange,
  } as any;

  const componentMap: MessageComponents = {
    text: FacebookTextMessage,
    card: FacebookCardsMessage,
    quickReplies: FacebookQuickRepliesMessage,
    input: FacebookInputMessage,
    ticketForm: FacebookTicketFormMessage,
    image: (props: FacebookMessageProps<{ type: 'image' }>) => (
      <FacebookMediaMessage {...props} />
    ),
    audio: (props: FacebookMessageProps<{ type: 'audio' }>) => (
      <FacebookMediaMessage {...props} />
    ),
    video: (props: FacebookMessageProps<{ type: 'video' }>) => (
      <FacebookMediaMessage {...props} />
    ),
    attachments: (props: FacebookMessageProps<{ type: 'attachments' }>) => (
      <FacebookMediaMessage {...props} />
    ),
  };

  const MessageComponent = componentMap[
    message.type
  ] as MessageComponents[TBotMessage['type']];

  return MessageComponent ? <MessageComponent {...updatedProps} /> : null;
};
