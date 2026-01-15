import { cn, Sheet, TextOverflowTooltip, useQueryState } from 'erxes-ui';
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
  const [messageId] = useQueryState('messageId');

  const { message } = useBroadcastMessage({
    variables: { _id: messageId },
    skip: !messageId,
  });

  return (
    <div className="flex items-center gap-2">
      <Sheet.Title className="lg:max-w-xl max-w-[18rem] sm:max-w-sm truncate">
        <TextOverflowTooltip value={message?.title} />
      </Sheet.Title>
    </div>
  );
};
