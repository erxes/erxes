import { isSameDay } from 'date-fns';
import {
  IconExternalLink,
  IconPhotoOff,
  IconPlayerPlay,
} from '@tabler/icons-react';
import { Dialog, Skeleton, readImage } from 'erxes-ui';
import { useEffect, useState } from 'react';

import { MessageContent } from '@/inbox/conversation-messages/components/MessageContent';
import { MessageEmbeds } from '@/inbox/conversation-messages/components/MessageEmbeds';
import { MessagePoll } from '@/inbox/conversation-messages/components/MessagePoll';
import { Attachments } from '@/inbox/conversation-messages/components/MessageAttachments';
import type {
  IMessageForwardedSnapshot,
  IMessageSticker,
} from '@/inbox/types/Conversation';
import { useFacebookPost } from '@/integrations/facebook/hooks/useFacebookPost';
import { useIgPost } from '@/integrations/instagram/hooks/useIgPost';
import { IntegrationType } from '@/types/Integration';

export const MessageDaySeparator = ({
  createdAt,
  previousCreatedAt,
}: {
  createdAt: string;
  previousCreatedAt?: string;
}) => {
  if (
    previousCreatedAt &&
    isSameDay(new Date(previousCreatedAt), new Date(createdAt))
  ) {
    return null;
  }
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      <time dateTime={createdAt}>
        {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
          new Date(createdAt),
        )}
      </time>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
};

export const DeliveryStatus = ({ status }: { status?: string }) => {
  if (!status || status === 'deleted') return null;
  return <span aria-label={`Message ${status}`}>· {status}</span>;
};

export const UnsupportedMessage = ({ text }: { text: string }) => (
  <div className="mt-2 flex items-center gap-2 rounded-md border border-dashed bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
    <IconPhotoOff className="size-4 shrink-0" />
    <span>{text}</span>
  </div>
);

export const StoryCard = ({
  kind,
  url,
  expiresAt,
  fallbackText,
  mediaType,
}: {
  kind?: string;
  url?: string;
  expiresAt?: string;
  fallbackText?: string;
  mediaType?: string;
}) => {
  const [failed, setFailed] = useState(false);
  const [resolvedMediaType, setResolvedMediaType] = useState<'image' | 'video'>(
    mediaType?.startsWith('video') ? 'video' : 'image',
  );
  const [expired, setExpired] = useState(
    Boolean(expiresAt && new Date(expiresAt) <= new Date()),
  );
  useEffect(() => {
    if (!expiresAt) return;
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) {
      setExpired(true);
      return;
    }
    const timeout = window.setTimeout(
      () => setExpired(true),
      Math.min(remaining, 2_147_483_647),
    );
    return () => window.clearTimeout(timeout);
  }, [expiresAt]);
  const unavailable = expired || failed || !url;
  const label = kind === 'story_reply' ? 'Story reply' : 'Story mention';

  if (unavailable) {
    return (
      <UnsupportedMessage
        text={
          expired ? `${label} expired` : fallbackText || 'Story unavailable'
        }
      />
    );
  }

  const mediaUrl = readImage(url);
  const media = (expanded: boolean) =>
    resolvedMediaType === 'video' ? (
      <video
        src={mediaUrl}
        controls={expanded}
        muted={!expanded}
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
        className={
          expanded
            ? 'block max-h-[88vh] max-w-[90vw] rounded-lg object-contain'
            : 'max-h-96 w-full bg-black object-contain'
        }
      />
    ) : (
      <img
        src={mediaUrl}
        alt={label}
        loading="lazy"
        onError={() => {
          if (!mediaType) {
            setResolvedMediaType('video');
            return;
          }
          setFailed(true);
        }}
        className={
          expanded
            ? 'block max-h-[88vh] max-w-[90vw] rounded-lg object-contain'
            : 'max-h-96 w-full object-contain'
        }
      />
    );

  return (
    <Dialog>
      <div className="mt-2 overflow-hidden rounded-xl border bg-background">
        <div className="flex items-center gap-2 border-b px-3 py-2 text-xs font-medium">
          <IconPlayerPlay className="size-4" />
          {label}
        </div>
        <Dialog.Trigger asChild>
          <button
            type="button"
            aria-label={`Preview ${label.toLowerCase()}`}
            className="relative block w-full cursor-zoom-in overflow-hidden bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {media(false)}
            {resolvedMediaType === 'video' && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="flex size-11 items-center justify-center rounded-full bg-black/65 text-white shadow-lg">
                  <IconPlayerPlay className="size-5 fill-current" />
                </span>
              </span>
            )}
          </button>
        </Dialog.Trigger>
      </div>
      <Dialog.Content className="!flex !h-auto !max-h-[92vh] !w-auto !max-w-[94vw] items-center justify-center !overflow-hidden !border-0 !bg-black/90 !p-2 shadow-2xl [&>button]:bg-white/10 [&>button]:text-white [&>button]:hover:bg-white/20">
        {media(true)}
      </Dialog.Content>
    </Dialog>
  );
};

export const ShareCard = ({
  url,
  attachmentType,
}: {
  url?: string;
  attachmentType?: string;
}) => {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  let safeUrl: string | undefined;
  try {
    safeUrl =
      url && ['http:', 'https:'].includes(new URL(url).protocol)
        ? url
        : undefined;
  } catch {
    safeUrl = undefined;
  }
  if (!safeUrl) return <UnsupportedMessage text="Shared content unavailable" />;

  const isInstagramPost = attachmentType === 'ig_post';
  const isInstagramReel = attachmentType === 'ig_reel';
  if (isInstagramPost || isInstagramReel) {
    const permalink = isInstagramReel ? safeUrl : undefined;
    const label = isInstagramReel ? 'Reel' : 'Post';
    const thumbnail = isInstagramPost
      ? safeUrl
      : `${safeUrl.replace(/\/$/, '')}/media/?size=m`;
    const preview = (
      <>
        {!thumbnailFailed && isInstagramPost ? (
          <Dialog>
            <Dialog.Trigger asChild>
              <button
                type="button"
                aria-label="Preview Instagram post image"
                className="size-16 shrink-0 cursor-zoom-in overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <img
                  src={thumbnail}
                  alt="Post preview"
                  loading="lazy"
                  onError={() => setThumbnailFailed(true)}
                  className="size-full object-cover"
                />
              </button>
            </Dialog.Trigger>
            <Dialog.Content className="!flex !h-auto !max-h-[92vh] !w-auto !max-w-[94vw] items-center justify-center !overflow-hidden !border-0 !bg-black/90 !p-2 shadow-2xl [&>button]:bg-white/10 [&>button]:text-white [&>button]:hover:bg-white/20">
              <img
                src={thumbnail}
                alt="Instagram post preview"
                className="block h-auto max-h-[88vh] w-auto max-w-[90vw] rounded-lg object-contain"
              />
            </Dialog.Content>
          </Dialog>
        ) : !thumbnailFailed ? (
          <img
            src={thumbnail}
            alt={`${label} preview`}
            loading="lazy"
            onError={() => setThumbnailFailed(true)}
            className="size-16 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted">
            <IconPlayerPlay className="size-5 text-muted-foreground" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-foreground">
            Instagram {label}
          </span>
          <span className="block text-xs text-muted-foreground">
            {permalink ? 'View on Instagram' : 'Post preview'}
          </span>
        </span>
        {permalink && (
          <IconExternalLink className="size-4 shrink-0 text-muted-foreground" />
        )}
      </>
    );

    return permalink ? (
      <a
        href={permalink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 flex w-56 items-center gap-2 rounded-xl border bg-background p-2 no-underline transition-colors hover:bg-muted/50"
      >
        {preview}
      </a>
    ) : (
      <div className="mt-1 flex w-56 items-center gap-2 rounded-xl border bg-background p-2">
        {preview}
      </div>
    );
  }

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex items-center gap-3 rounded-lg border bg-background px-3 py-3 no-underline hover:bg-muted/50"
    >
      <IconExternalLink className="size-5 shrink-0 text-muted-foreground" />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">
          Shared content
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {safeUrl}
        </span>
      </span>
    </a>
  );
};

export const PostMediaCard = ({
  conversationId,
  integrationKind,
  fallbackUrl,
}: {
  conversationId: string;
  integrationKind:
    | IntegrationType.FACEBOOK_POST
    | IntegrationType.INSTAGRAM_POST;
  fallbackUrl?: string;
}) => {
  const isFacebook = integrationKind === IntegrationType.FACEBOOK_POST;
  const { post: facebookPost, loading: facebookLoading } = useFacebookPost({
    erxesApiId: isFacebook ? conversationId : '',
  });
  const { post: instagramPost, loading: instagramLoading } = useIgPost({
    erxesApiId: isFacebook ? undefined : conversationId,
  });
  const post = isFacebook ? facebookPost : instagramPost;
  const permalink = post?.permalink_url;
  const thumbnail = post?.attachments?.[0]?.url || fallbackUrl;
  const label = permalink?.includes('/reel/') ? 'Reel' : 'Post';

  if (facebookLoading || instagramLoading) {
    return <Skeleton className="mt-1 h-20 w-52 rounded-xl" />;
  }

  const card = (
    <>
      {thumbnail ? (
        <img
          src={readImage(thumbnail)}
          alt={`${label} preview`}
          loading="lazy"
          className="size-16 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted">
          <IconPhotoOff className="size-5 text-muted-foreground" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">
          {label}
        </span>
        <span className="block text-xs text-muted-foreground">
          View on {isFacebook ? 'Facebook' : 'Instagram'}
        </span>
      </span>
      {permalink && (
        <IconExternalLink className="size-4 text-muted-foreground" />
      )}
    </>
  );

  if (!permalink) {
    return (
      <div className="mt-1 flex w-52 items-center gap-2 rounded-xl border bg-background p-2">
        {card}
      </div>
    );
  }

  return (
    <a
      href={permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 flex w-52 items-center gap-2 rounded-xl border bg-background p-2 no-underline transition-colors hover:bg-muted/50"
    >
      {card}
    </a>
  );
};

export const StickerCard = ({ sticker }: { sticker: IMessageSticker }) => {
  const [failed, setFailed] = useState(false);

  if (!sticker.url || failed) {
    return <UnsupportedMessage text={`Sticker · ${sticker.name}`} />;
  }

  return (
    <div className="mt-1 max-w-48">
      <img
        src={sticker.url}
        alt={sticker.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className="max-h-48 max-w-48 object-contain"
      />
      <div className="mt-1 truncate text-xs text-muted-foreground">
        {sticker.name}
      </div>
    </div>
  );
};

export const ForwardedMessageCard = ({
  snapshot,
}: {
  snapshot: IMessageForwardedSnapshot;
}) => {
  const socialShareAttachment = snapshot.attachments?.find(
    (attachment) =>
      attachment.type === 'share' ||
      attachment.type === 'ig_post' ||
      attachment.type === 'ig_reel',
  );

  return (
    <div className="mt-1 overflow-hidden rounded-xl bg-muted/60 px-3 py-2">
      <div className="text-xs font-medium text-muted-foreground">
        Forwarded message
      </div>
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
          {snapshot.stickers?.map((sticker) => (
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
