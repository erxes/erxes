import { IconArrowBackUp } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTelegramTranslation } from './translations';
import type { ITelegramMessageData } from '@/inbox/types/Conversation';
import { telegramReplyToState } from './telegramReplyToState';

export const TelegramMessageActions = ({
  conversationId,
  messageId,
  content,
}: {
  conversationId: string;
  messageId: string;
  content: string;
}) => {
  const setReply = useSetAtom(telegramReplyToState);
  const { t } = useTelegramTranslation();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      type="button"
      aria-label={t('reply')}
      onClick={() =>
        setReply({
          conversationId,
          messageId,
          preview:
            new DOMParser()
              .parseFromString(content, 'text/html')
              .body.textContent?.slice(0, 100) || t('message'),
        })
      }
    >
      <IconArrowBackUp className="size-4" />
    </Button>
  );
};

export const TelegramMessageQuote = ({
  data,
}: {
  data?: ITelegramMessageData;
}) => {
  const { t } = useTelegramTranslation();
  if (!data?.replyTo?.messageId) return null;
  return (
    <div className="mt-2 border-l-2 border-primary/50 pl-2 text-xs text-muted-foreground">
      <div className="font-medium">
        {t('replyingTo')} {data.replyTo.senderName}
      </div>
      <div className="line-clamp-3 whitespace-pre-wrap">
        {data.replyTo.content}
      </div>
    </div>
  );
};

export const TelegramMessageStatus = ({
  data,
}: {
  data?: ITelegramMessageData;
}) => {
  const { t } = useTelegramTranslation();
  if (!data) return null;
  return (
    <div className="mt-1 space-y-1 text-xs text-muted-foreground">
      {data.mediaGroupId && <div>{t('albumPart')}</div>}
      {data.editedAt && <div>{t('edited')}</div>}
      {data.contentType === 'poll' && <div>{t('pollVoting')}</div>}
      {!!data.reactions?.length && (
        <div className="flex flex-wrap gap-1" title={t('observedReactions')}>
          {data.reactions.map((reaction) => (
            <span key={reaction.key} className="rounded border px-1.5 py-0.5">
              {reaction.label} {reaction.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
