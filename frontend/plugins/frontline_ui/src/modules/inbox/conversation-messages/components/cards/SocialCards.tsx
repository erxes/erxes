import { IconExternalLink, IconPlayerPlay } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { InboxImage } from '@/inbox/conversation-messages/components/InboxImage';
import { UnsupportedMessage } from '@/inbox/conversation-messages/components/messages/MessageStatus';

export const StoryCard = ({
  kind,
  url,
  sourceUrl,
  expiresAt,
  fallbackText,
  mediaType,
}: {
  kind?: string;
  url?: string;
  sourceUrl?: string;
  expiresAt?: string;
  fallbackText?: string;
  mediaType?: string;
}) => {
  const [failed, setFailed] = useState(false);
  const [expired, setExpired] = useState(
    Boolean(expiresAt && new Date(expiresAt) <= new Date()),
  );

  useEffect(() => {
    if (!expiresAt) {
      return undefined;
    }
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) {
      setExpired(true);
      return undefined;
    }
    const timeout = window.setTimeout(
      () => setExpired(true),
      Math.min(remaining, 2_147_483_647),
    );
    return () => {
      window.clearTimeout(timeout);
    };
  }, [expiresAt]);

  const displayUrl = url || sourceUrl;
  const unavailable = expired || failed || !displayUrl;
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
      {mediaType?.startsWith('video') ? (
        <video
          src={displayUrl}
          controls
          playsInline
          onError={() => setFailed(true)}
          className="max-h-96 w-full object-contain"
        >
          <track kind="captions" />
        </video>
      ) : (
        <InboxImage
          src={displayUrl}
          alt={label}
          loading="lazy"
          onError={() => setFailed(true)}
          className="max-h-96 w-full object-contain"
        />
      )}
    </div>
  );
};

export const ShareCard = ({
  url,
  title,
  previewUrl,
  shareType,
  attachmentType,
}: {
  url?: string;
  title?: string;
  previewUrl?: string;
  shareType?: 'post' | 'reel';
  attachmentType?: string;
}) => {
  let safeUrl: string | undefined;
  try {
    safeUrl =
      url && ['http:', 'https:'].includes(new URL(url).protocol)
        ? url
        : undefined;
  } catch {
    safeUrl = undefined;
  }

  if (attachmentType === 'ig_post' || attachmentType === 'ig_reel') {
    const isReel = attachmentType === 'ig_reel' || shareType === 'reel';
    const label = isReel ? 'Reel' : 'Post';
    const permalink = safeUrl;

    const preview = (
      <>
        {previewUrl ? (
          <InboxImage
            src={previewUrl}
            alt={`Instagram ${label}`}
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
          {title || 'Shared content'}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {safeUrl}
        </span>
      </span>
    </a>
  );
};
