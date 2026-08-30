import { isSameDay } from 'date-fns';
import {
  IconExternalLink,
  IconPhotoOff,
  IconPlayerPlay,
  IconShare3,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { MessageContent } from '@/inbox/conversation-messages/components/MessageContent';
import { MessageEmbeds } from '@/inbox/conversation-messages/components/MessageEmbeds';
import { Attachments } from '@/inbox/conversation-messages/components/MessageAttachments';
import type {
  IMessageForwardedSnapshot,
  IMessageSticker,
} from '@/inbox/types/Conversation';

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
}: {
  kind?: string;
  url?: string;
  expiresAt?: string;
  fallbackText?: string;
}) => {
  const [failed, setFailed] = useState(false);
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

  return (
    <div className="mt-2 overflow-hidden rounded-xl border bg-background">
      <div className="flex items-center gap-2 border-b px-3 py-2 text-xs font-medium">
        <IconPlayerPlay className="size-4" />
        {label}
      </div>
      <img
        src={url}
        alt={label}
        loading="lazy"
        onError={() => setFailed(true)}
        className="max-h-96 w-full object-contain"
      />
    </div>
  );
};

export const ShareCard = ({ url }: { url?: string }) => {
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
}) => (
  <div className="mt-2 overflow-hidden rounded-lg border-l-2 border-primary/60 bg-muted/60 px-3 py-2">
    <div className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <IconShare3 className="size-3.5" /> Forwarded message
    </div>
    {snapshot.content && (
      <MessageContent content={snapshot.content} internal={false} />
    )}
    <Attachments attachments={snapshot.attachments} />
    {Boolean(snapshot.stickers?.length) && (
      <div className="flex flex-wrap gap-2">
        {snapshot.stickers?.map((sticker) => (
          <StickerCard key={sticker.id} sticker={sticker} />
        ))}
      </div>
    )}
    <MessageEmbeds embeds={snapshot.embeds} />
    {!snapshot.content &&
      !snapshot.attachments?.length &&
      !snapshot.stickers?.length &&
      !snapshot.embeds?.length && (
        <UnsupportedMessage text="Forwarded message unavailable" />
      )}
  </div>
);
