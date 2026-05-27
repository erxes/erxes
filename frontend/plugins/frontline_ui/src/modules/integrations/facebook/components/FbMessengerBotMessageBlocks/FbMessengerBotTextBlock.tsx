import { MessageContent } from '@/inbox/conversation-messages/components/MessageContent';
import { TBotData } from '@/integrations/facebook/types/FacebookTypes';
import { cn } from 'erxes-ui';

type TBotTextBlockData = Extract<TBotData, { type: 'text' }>;

export const FbMessengerBotTextBlock = ({
  data,
  internal,
}: {
  data: TBotTextBlockData;
  internal?: boolean;
}) => {
  return (
    <div
      className={cn(
        'rounded-xl bg-background px-3 py-2.5 text-sm ring-1 ring-border/60',
        internal && 'bg-yellow-50 ring-yellow-200 dark:bg-yellow-950/40',
      )}
    >
      <MessageContent content={data.text} internal={internal} />
    </div>
  );
};
