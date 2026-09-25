import { format, isValid } from 'date-fns';
import {
  FacebookSentMessagePart,
  getSentPartLabel,
} from '~/widgets/automations/modules/facebook/components/history/FacebookSentMessagePart';
import { TFacebookSentMessage } from '~/widgets/automations/modules/facebook/components/history/types';

const formatSentAt = (createdAt?: string) => {
  const date = createdAt ? new Date(createdAt) : null;

  return date && isValid(date) ? format(date, 'HH:mm:ss') : '';
};

export const FacebookSentMessageStep = ({
  message,
}: {
  message: TFacebookSentMessage;
}) => {
  const sentAt = formatSentAt(message.createdAt);

  return (
    <li className="min-w-0 space-y-1.5 rounded-md border bg-muted/30 p-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex size-4 items-center justify-center rounded-full bg-foreground/10 text-[10px] font-medium text-foreground">
          {message.order}
        </span>
        <span className="font-medium text-foreground">
          {getSentPartLabel(message.parts[0])}
        </span>
        {sentAt && <span>· {sentAt}</span>}
        {message.mid && (
          <span className="ml-auto truncate font-mono" title={message.mid}>
            {message.mid.slice(-8)}
          </span>
        )}
      </div>

      <div className="min-w-0 space-y-1.5">
        {message.parts.length ? (
          message.parts.map((part, index) => (
            <FacebookSentMessagePart
              key={`${part.type}-${index}`}
              part={part}
            />
          ))
        ) : (
          // Older runs recorded only the flattened content
          <div
            className="prose prose-sm max-w-none break-words text-xs [&_p]:my-0"
            dangerouslySetInnerHTML={{ __html: message.content || '' }}
          />
        )}
      </div>
    </li>
  );
};
