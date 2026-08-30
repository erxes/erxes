import { ConversationFormDisplay } from '@/inbox/conversation-messages/components/ConversationFormDisplay';
import { MessageActions } from '@/inbox/conversation-messages/components/MessageActions';
import { MESSAGE_ACTION_BAR_CLASS } from '@/inbox/conversation-messages/components/MessageItemHelpers';
import { MessageWrapper } from '@/inbox/conversation-messages/components/MessageWrapper';
import type { IMessage } from '@/inbox/types/Conversation';

type FormWidgetMessageProps = {
  message: IMessage;
  isDeleted: boolean;
  additionalActions?: React.ReactNode;
};

export const FormWidgetMessage = ({
  message,
  isDeleted,
  additionalActions,
}: FormWidgetMessageProps) => (
  // skipcq: JS-0357
  <MessageWrapper
    actions={
      !isDeleted ? (
        <div className={MESSAGE_ACTION_BAR_CLASS}>
          <MessageActions
            message={message}
            additionalActions={additionalActions}
          />
        </div>
      ) : undefined
    }
  >
    <ConversationFormDisplay {...message} />
  </MessageWrapper>
);
