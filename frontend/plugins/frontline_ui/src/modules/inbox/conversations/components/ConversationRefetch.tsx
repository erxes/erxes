import { Button, Tooltip } from 'erxes-ui';
import { IconRotateClockwise } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { refetchNewMessagesState } from '@/inbox/conversations/states/newMessagesCountState';
import { useAtomValue } from 'jotai';
import { newMessagesCountState } from '@/inbox/conversations/states/newMessagesCountState';

export const ConversationRefetch = () => {
  const newMessagesCount = useAtomValue(newMessagesCountState);
  const setRefetchNewMessages = useSetAtom(refetchNewMessagesState);

  return (
    <Tooltip.Provider>
      <Tooltip delayDuration={0}>
        <Tooltip.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setRefetchNewMessages(true)}
          >
            <IconRotateClockwise />{' '}
            {newMessagesCount > 0 && (
              <div className="size-3.5 bg-destructive text-primary-foreground rounded-full text-xs absolute top-0 right-0">
                {newMessagesCount}
              </div>
            )}
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Refresh</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
