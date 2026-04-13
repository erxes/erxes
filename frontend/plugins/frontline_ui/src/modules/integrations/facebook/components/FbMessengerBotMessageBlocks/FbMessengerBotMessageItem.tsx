import { FbMessengerMessageAttachments } from '@/integrations/facebook/components/FbMessengerMessageAttachments';
import { TBotData } from '@/integrations/facebook/types/FacebookTypes';
import { IAttachment, RelativeDateDisplay, cn } from 'erxes-ui';
import { BotAuthorBadge } from './BotAuthorBadge';
import { FbMessengerBotMessageBlocks } from './FbMessengerBotMessageBlocks';

export const FbMessengerBotMessageItem = ({
  botData,
  attachments,
  createdAt,
  separatePrevious,
  separateNext,
  userId,
  internal,
}: {
  botData: TBotData[];
  attachments?: IAttachment[];
  createdAt: string;
  separatePrevious: boolean;
  separateNext: boolean;
  userId?: string;
  internal?: boolean;
}) => {
  return (
    <div className="max-w-92 flex flex-row gap-2 items-end">
      <div>
        <FbMessengerBotMessageBlocks
          botData={botData}
          className={cn(separatePrevious ? 'mt-8' : 'mt-2')}
          internal={internal}
          userId={userId}
        />

        <FbMessengerMessageAttachments attachments={attachments} />

        {separateNext && (
          <div className="mt-1 text-muted-foreground">
            <RelativeDateDisplay value={createdAt}>
              <RelativeDateDisplay.Value value={createdAt} />
            </RelativeDateDisplay>
          </div>
        )}
      </div>
      <BotAuthorBadge />
    </div>
  );
};
