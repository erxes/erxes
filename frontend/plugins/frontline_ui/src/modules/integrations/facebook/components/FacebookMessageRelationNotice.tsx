import { useFbMessengerMessageContext } from '@/integrations/facebook/contexts/FbMessengerMessageContext';
import { IconMessage2, IconQuote } from '@tabler/icons-react';
import { Button, cn, useMultiQueryState } from 'erxes-ui';

const COMMENT_PRIVATE_REPLY_SOURCE_TYPE = 'facebook_comment_private_reply';

const getPreviewText = (content = '', maxLength = 72) => {
  const plainText = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength - 1)}...`;
};

export const FacebookMessageRelationNotice = ({
  placement,
}: {
  placement: 'comment' | 'messenger';
}) => {
  const { source, relatedMessage } = useFbMessengerMessageContext();
  const [, setQueryValues] = useMultiQueryState<{
    conversationId: string;
    messageId: string;
  }>(['conversationId', 'messageId']);

  const relation =
    placement === 'comment'
      ? {
          label: 'Sent in Messenger',
          content: relatedMessage?.content,
          conversationId: relatedMessage?.conversationId,
          messageId: relatedMessage?.messageId,
          Icon: IconMessage2,
        }
      : source?.type === COMMENT_PRIVATE_REPLY_SOURCE_TYPE
      ? {
          label: 'Reply to comment',
          content: source.content,
          conversationId: source.conversationId,
          messageId: source.messageId,
          Icon: IconQuote,
        }
      : null;

  if (!relation?.conversationId || !relation.messageId) {
    return null;
  }

  const preview = getPreviewText(relation.content);
  const Icon = relation.Icon;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        'mt-1 h-7 max-w-full justify-start gap-1.5 rounded-md border border-border/60 bg-background/70 px-2 text-xs font-medium text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground',
        placement === 'messenger' && 'mb-1 mt-0 self-end',
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        setQueryValues({
          conversationId: relation.conversationId,
          messageId: relation.messageId,
        });
      }}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="shrink-0">{relation.label}</span>
      {!!preview && (
        <span className="truncate font-normal text-muted-foreground/80">
          {preview}
        </span>
      )}
    </Button>
  );
};
