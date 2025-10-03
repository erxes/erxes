import { FieldPath } from 'react-hook-form';
import { FacebookInputMessage } from '~/widgets/automations/modules/facebook/components/action/components/FacebookInputMessage';
import { TBotMessage } from '../states/replyMessageActionForm';
import { FacebookCardsMessage } from './FacebookCardsMessage';
import { FacebookQuickRepliesMessage } from './FacebookQuickRepliesMessage';
import { FacebookTextMessage } from './FacebookTextMessage';

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
  };

  const componentMap: Record<
    TBotMessage['type'],
    React.ComponentType<typeof updatedProps>
  > = {
    text: FacebookTextMessage,
    card: FacebookCardsMessage,
    quickReplies: FacebookQuickRepliesMessage,
    input: FacebookInputMessage,
  };

  const MessageComponent = componentMap[message.type];

  return MessageComponent ? <MessageComponent {...updatedProps} /> : null;
};
