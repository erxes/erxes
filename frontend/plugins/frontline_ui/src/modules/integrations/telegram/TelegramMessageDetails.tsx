import { useTelegramTranslation } from './translations';
import type { ITelegramMessageData } from '@/inbox/types/Conversation';

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
