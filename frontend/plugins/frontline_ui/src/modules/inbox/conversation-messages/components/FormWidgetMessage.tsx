import { IconDots } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';

import { ConversationFormDisplay } from '@/inbox/conversation-messages/components/ConversationFormDisplay';
import { MessageActions } from '@/inbox/conversation-messages/components/MessageActions';
import { MESSAGE_ACTION_BAR_CLASS } from '@/inbox/conversation-messages/constants/messageActions';
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
}: FormWidgetMessageProps) => {
  const [actionsOpen, setActionsOpen] = useState(false);

  return (
    // skipcq: JS-0357
    <MessageWrapper
      actions={
        !isDeleted ? (
          <>
            <div className={MESSAGE_ACTION_BAR_CLASS}>
              <MessageActions
                message={message}
                additionalActions={additionalActions}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 rounded-full bg-background shadow-sm md:hidden"
              aria-label="Message actions"
              onClick={() => setActionsOpen(true)}
            >
              <IconDots className="size-4" />
            </Button>
          </>
        ) : undefined
      }
    >
      <ConversationFormDisplay {...message} />
      {!isDeleted && (
        <Sheet open={actionsOpen} onOpenChange={setActionsOpen}>
          <Sheet.View
            side="bottom"
            className="rounded-t-2xl rounded-b-none bg-background px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <div className="mb-3 text-sm font-semibold">Message actions</div>
            <div className="flex min-h-12 items-center justify-center gap-1 rounded-xl border bg-muted/35 p-2">
              <MessageActions
                message={message}
                additionalActions={additionalActions}
              />
            </div>
          </Sheet.View>
        </Sheet>
      )}
    </MessageWrapper>
  );
};
