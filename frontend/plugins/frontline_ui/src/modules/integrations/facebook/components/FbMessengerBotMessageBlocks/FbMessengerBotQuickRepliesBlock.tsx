import { MessageContent } from '@/inbox/conversation-messages/components/MessageContent';
import { TBotData } from '@/integrations/facebook/types/FacebookTypes';
import { cn } from 'erxes-ui';

type TBotQuickRepliesBlockData = Extract<TBotData, { type: 'quick_replies' }>;

export const FbMessengerBotQuickRepliesBlock = ({
  data,
  internal,
}: {
  data: TBotQuickRepliesBlockData;
  internal?: boolean;
}) => {
  return (
    <div
      className={cn(
        'rounded-xl bg-background px-3 py-2.5 ring-1 ring-border/60',
        internal && 'bg-yellow-50 ring-yellow-200 dark:bg-yellow-950/40',
      )}
    >
      <MessageContent content={data.text} internal={internal} />

      <div className="mt-3 flex flex-wrap gap-2">
        {data.quick_replies.map((reply, index) => (
          <div
            key={`${reply.title}-${index}`}
            className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium"
          >
            {reply.title}
          </div>
        ))}
      </div>
    </div>
  );
};
