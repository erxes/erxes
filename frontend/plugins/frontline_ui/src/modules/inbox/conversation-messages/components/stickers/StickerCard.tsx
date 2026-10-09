import { useCallback, useState } from 'react';
import { InboxImage } from '@/inbox/conversation-messages/components/InboxImage';
import type { IMessageSticker } from '@/inbox/types/Conversation';
import { LottieSticker } from '@/inbox/conversation-messages/components/stickers/LottieSticker';
import { getStickerImageUrl } from '@/inbox/conversation-messages/utils/stickerImage';
import { UnsupportedMessage } from '@/inbox/conversation-messages/components/messages/MessageStatus';

export const StickerCard = ({ sticker }: { sticker: IMessageSticker }) => {
  const imageUrl = getStickerImageUrl(sticker);
  const [failedUrl, setFailedUrl] = useState<string>();
  const [failureReason, setFailureReason] = useState<string>();
  const handleError = useCallback(
    (reason?: string) => {
      setFailedUrl(imageUrl);
      setFailureReason(reason);
    },
    [imageUrl],
  );

  if (!imageUrl || failedUrl === imageUrl) {
    return (
      <div title={failureReason}>
        <UnsupportedMessage text={`Sticker · ${sticker.name}`} />
      </div>
    );
  }

  return (
    <div className="mt-1 max-w-48 bg-transparent">
      {sticker.formatType === 3 ? (
        <LottieSticker
          stickerId={sticker.id}
          name={sticker.name}
          onError={handleError}
        />
      ) : (
        <InboxImage
          src={imageUrl}
          alt={sticker.name}
          loading="lazy"
          onError={() => handleError('Sticker image is unavailable')}
          className="max-h-48 max-w-48 rounded-lg bg-transparent object-contain"
        />
      )}
      <div className="mt-1 truncate text-xs text-muted-foreground">
        {sticker.name}
      </div>
    </div>
  );
};
