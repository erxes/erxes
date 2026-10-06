import { RelativeDateDisplay, cn } from 'erxes-ui';
import type { MessagePresentationState } from '@/inbox/conversation-messages/types/MessagePresentation';
import { MessageEmbeds } from '@/inbox/conversation-messages/components/MessageEmbeds';
import { MessagePoll } from '@/inbox/conversation-messages/components/MessagePoll';
import { MessageSurvey } from '@/inbox/conversation-messages/components/MessageSurvey';
import {
  DiscordEditedStatus,
  getMessageBubbleClassName,
} from '@/inbox/conversation-messages/components/MessageItemHelpers';
import { Attachments } from '@/inbox/conversation-messages/components/MessageAttachments';
import {
  DeliveryStatus,
  UnsupportedMessage,
} from '@/inbox/conversation-messages/components/messages/MessageStatus';
import { ForwardedMessageCard } from '@/inbox/conversation-messages/components/cards/ForwardedMessageCard';
import { PostMediaCard } from '@/inbox/conversation-messages/components/cards/PostMediaCard';
import {
  ShareCard,
  StoryCard,
} from '@/inbox/conversation-messages/components/cards/SocialCards';
import { StickerCard } from '@/inbox/conversation-messages/components/stickers/StickerCard';
import {
  MessageForwardedIndicator,
  VoiceMessageLabel,
} from '@/inbox/conversation-messages/components/MessageItemDetails';

type MessageContentProps = { presentation: MessagePresentationState };

const StoryMessageMedia = ({ presentation }: MessageContentProps) => {
  const { message, displayAttachments, fallbackText } = presentation;
  const { messageKind, providerData, expiresAt } = message;
  const attachment = displayAttachments?.[0];
  const isShare = providerData?.attachmentType === 'share';
  return (
    <StoryCard
      kind={messageKind}
      url={providerData?.storyUrl || (isShare ? undefined : attachment?.url)}
      sourceUrl={isShare ? attachment?.url : undefined}
      expiresAt={expiresAt}
      fallbackText={fallbackText}
      mediaType={attachment?.type}
    />
  );
};

const ShareMessageMedia = ({ presentation }: MessageContentProps) => {
  const { message, displayAttachments, socialShareAttachment } = presentation;
  const { providerData } = message;
  return (
    <ShareCard
      url={socialShareAttachment?.url || displayAttachments?.[0]?.url}
      title={socialShareAttachment?.name || displayAttachments?.[0]?.name}
      previewUrl={providerData?.previewUrl}
      shareType={providerData?.shareType}
      attachmentType={
        socialShareAttachment?.type || providerData?.attachmentType
      }
    />
  );
};

const MessageMediaCard = ({ presentation }: MessageContentProps) => {
  const {
    message,
    conversationId,
    postIntegrationKind,
    displayAttachments,
    socialShareAttachment,
    forwardedSnapshot,
    isStory,
  } = presentation;
  if (isStory) return <StoryMessageMedia presentation={presentation} />;
  if (message.messageKind === 'share' || socialShareAttachment) {
    return <ShareMessageMedia presentation={presentation} />;
  }
  if (postIntegrationKind && displayAttachments?.length) {
    return (
      <PostMediaCard
        conversationId={conversationId}
        integrationKind={postIntegrationKind}
        fallbackUrl={displayAttachments[0]?.url}
      />
    );
  }
  return (
    <Attachments
      attachments={forwardedSnapshot ? undefined : displayAttachments}
    />
  );
};

export const MessageItemMedia = ({ presentation }: MessageContentProps) => {
  const { stickers } = presentation;
  return (
    <>
      <MessageMediaCard presentation={presentation} />
      {Boolean(stickers?.length) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {stickers?.map((sticker) => (
            <StickerCard key={sticker.id} sticker={sticker} />
          ))}
        </div>
      )}
    </>
  );
};

const MessageItemFooter = ({ presentation }: MessageContentProps) => {
  const { message, displayAttachments, poll, survey, embeds, hasTextBubble } =
    presentation;
  const { userId, createdAt, extraData, separateNext, deliveryStatus } =
    message;
  if (
    hasTextBubble ||
    !separateNext ||
    !(displayAttachments?.length || poll || survey || embeds?.length)
  )
    return null;
  return (
    <div
      className={cn(
        'text-muted-foreground mt-1 text-xs',
        userId ? 'text-right' : 'text-left',
      )}
    >
      <RelativeDateDisplay value={createdAt}>
        <RelativeDateDisplay.Value value={createdAt} />
      </RelativeDateDisplay>
      <DeliveryStatus status={userId ? deliveryStatus : undefined} />
      <DiscordEditedStatus edited={Boolean(extraData?.discordEditedAt)} />
    </div>
  );
};

export const MessageItemContent = ({ presentation }: MessageContentProps) => {
  const {
    message,
    socialShareAttachment,
    forwardedSnapshot,
    poll,
    survey,
    embeds,
    hasTextBubble,
    isStory,
    fallbackText,
    showAuthorName,
    showBotName,
  } = presentation;
  const {
    userId,
    extraData,
    internal,
    fromBot,
    separatePrevious,
    isBotMessage,
  } = message;
  return (
    <>
      {forwardedSnapshot && (
        <>
          <MessageForwardedIndicator />
          <ForwardedMessageCard
            snapshot={forwardedSnapshot}
            className={getMessageBubbleClassName({
              userId,
              internal,
              fromBot,
              isBotMessage,
              separatePrevious,
              showAuthorName,
              showBotName,
              hasReply: true,
            })}
          />
        </>
      )}
      {extraData?.voiceMessage && <VoiceMessageLabel />}
      {!hasTextBubble && !isStory && !socialShareAttachment && fallbackText && (
        <UnsupportedMessage text={fallbackText} />
      )}
      {poll && <MessagePoll poll={poll} />}
      {survey && <MessageSurvey survey={survey} />}
      <MessageEmbeds embeds={embeds} />
      <MessageItemFooter presentation={presentation} />
    </>
  );
};
