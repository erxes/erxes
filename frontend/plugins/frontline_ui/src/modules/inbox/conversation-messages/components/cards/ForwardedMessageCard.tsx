import { cn, type IAttachment } from 'erxes-ui';
import { Attachments } from '@/inbox/conversation-messages/components/MessageAttachments';
import { MessageContent } from '@/inbox/conversation-messages/components/MessageContent';
import { MessageEmbeds } from '@/inbox/conversation-messages/components/MessageEmbeds';
import { MessagePoll } from '@/inbox/conversation-messages/components/MessagePoll';
import type {
  IMessageForwardedSnapshot,
  IMessageSticker,
} from '@/inbox/types/Conversation';
import { ShareCard } from '@/inbox/conversation-messages/components/cards/SocialCards';
import { StickerCard } from '@/inbox/conversation-messages/components/stickers/StickerCard';
import { UnsupportedMessage } from '@/inbox/conversation-messages/components/messages/MessageStatus';

export const ForwardedMessageCard = ({
  snapshot,
  className,
}: {
  snapshot: IMessageForwardedSnapshot;
  className?: string;
}) => {
  const socialShareAttachment = snapshot.attachments?.find(
    (attachment: IAttachment) =>
      attachment.type === 'share' ||
      attachment.type === 'ig_post' ||
      attachment.type === 'ig_reel',
  );

  return (
    <div
      className={cn(
        'mt-1 overflow-hidden rounded-xl bg-muted/60 px-3 py-2',
        className,
      )}
    >
      {snapshot.content && (
        <MessageContent content={snapshot.content} internal={false} />
      )}
      {socialShareAttachment ? (
        <ShareCard
          url={socialShareAttachment.url}
          attachmentType={socialShareAttachment.type}
        />
      ) : (
        <Attachments attachments={snapshot.attachments} />
      )}
      {Boolean(snapshot.stickers?.length) && (
        <div className="flex flex-wrap gap-2">
          {snapshot.stickers?.map((sticker: IMessageSticker) => (
            <StickerCard key={sticker.id} sticker={sticker} />
          ))}
        </div>
      )}
      <MessageEmbeds embeds={snapshot.embeds} />
      {snapshot.poll && <MessagePoll poll={snapshot.poll} />}
      {!snapshot.content &&
        !snapshot.attachments?.length &&
        !snapshot.stickers?.length &&
        !snapshot.embeds?.length &&
        !snapshot.poll && (
          <UnsupportedMessage text="Forwarded message unavailable" />
        )}
    </div>
  );
};
