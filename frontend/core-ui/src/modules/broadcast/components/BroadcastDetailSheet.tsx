import { IconPencil } from '@tabler/icons-react';
import {
  Button,
  cn,
  Sheet,
  TextOverflowTooltip,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { IBroadcastMethodEnum } from '../types';
import { useBroadcastMessage } from '../hooks/useBroadcastMessage';
import { BroadcastDetail } from './BroadcastDetail';

export const BroadcastDetailSheet = () => {
  const [messageId, setMessageId] = useQueryState<string>('messageId');

  return (
    <Sheet
      open={!!messageId}
      onOpenChange={() => {
        setMessageId(null);
      }}
    >
      <Sheet.View
        className={cn(
          'p-0 md:max-w-5xl md:w-[calc(100vw-(--spacing(4)))] xl:w-3/4 flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none',
        )}
      >
        <Sheet.Header>
          <BroadcastDetailSheetHeader />
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-y-auto">
          <BroadcastDetail messageId={messageId} />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

export const BroadcastDetailSheetHeader = () => {
  const [{ messageId }, setQueryParams] = useMultiQueryState<{
    messageId: string;
    editMessageId: string;
    method: IBroadcastMethodEnum;
  }>(['messageId', 'editMessageId', 'method']);

  const { message } = useBroadcastMessage({
    variables: { _id: messageId },
    skip: !messageId,
  });

  // Once a campaign is live it is already reaching people: what it says, who
  // it reaches and the flow it runs are all settled.
  const canEdit = !!messageId && !message?.isLive;

  return (
    <div className="flex flex-1 items-center gap-2">
      <Sheet.Title className="lg:max-w-xl max-w-[18rem] sm:max-w-sm truncate">
        <TextOverflowTooltip value={message?.title} />
      </Sheet.Title>

      {canEdit && (
        <Button
          variant="outline"
          size="sm"
          className="ml-auto mr-2"
          onClick={() =>
            setQueryParams({
              messageId: null,
              editMessageId: messageId,
              method: message?.method,
            })
          }
        >
          <IconPencil className="size-4" />
          Edit
        </Button>
      )}
    </div>
  );
};
