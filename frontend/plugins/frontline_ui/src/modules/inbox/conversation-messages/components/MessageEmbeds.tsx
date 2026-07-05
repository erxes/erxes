import { cn } from 'erxes-ui';
import { IconPlayerPlayFilled } from '@tabler/icons-react';
import { IMessageEmbed } from '@/inbox/types/Conversation';

// erxes runs on Vite, not Next.js, so next/image (JS-W1015) doesn't apply here.
// This thin wrapper localizes the single suppression instead of repeating it at
// every embed image.
const Img = (props: JSX.IntrinsicElements['img']) => (
  // skipcq: JS-W1015
  <img {...props} />
);

// Discord embed media (image/thumbnail/video) carry absolute Discord/Tenor CDN
// URLs, so they're used as-is (not run through `readImage`, which is for erxes
// storage keys).

// Tenor/Giphy GIFs arrive as `gifv` embeds whose `video.url` is a real mp4, so
// they can play inline. A `video` embed (YouTube, etc.) instead carries an
// iframe URL in `video.url` that can't go in a <video> tag — those render as a
// click-to-open thumbnail card via `VideoEmbed`.
const isInlineGif = (embed: IMessageEmbed) =>
  embed.type === 'gifv' && Boolean(embed.video?.url);

const isImageOnly = (embed: IMessageEmbed) =>
  embed.type === 'image' &&
  Boolean(embed.image?.url) &&
  !embed.title &&
  !embed.description;

const isVideoCard = (embed: IMessageEmbed) =>
  embed.type === 'video' && Boolean(embed.thumbnail?.url || embed.image?.url);

const mediaAspect = (media?: { width?: number; height?: number }) =>
  media?.width && media?.height
    ? `${media.width} / ${media.height}`
    : undefined;

// Provider / author / title / description — shared by video cards and rich
// embeds so a YouTube card and a bot embed share the same heading layout.
const EmbedHeading = ({ embed }: { embed: IMessageEmbed }) => (
  <>
    {embed.author?.name && (
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium">
        {embed.author.iconUrl && (
          <Img src={embed.author.iconUrl} alt="" className="size-4 rounded-full" />
        )}
        {embed.author.url ? (
          <a
            href={embed.author.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {embed.author.name}
          </a>
        ) : (
          <span>{embed.author.name}</span>
        )}
      </div>
    )}

    {embed.provider?.name && !embed.author?.name && (
      <div className="mb-0.5 text-xs text-muted-foreground">
        {embed.provider.name}
      </div>
    )}

    {embed.title &&
      (embed.url ? (
        <a
          href={embed.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-primary hover:underline"
        >
          {embed.title}
        </a>
      ) : (
        <div className="text-sm font-semibold">{embed.title}</div>
      ))}

    {embed.description && (
      <div className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">
        {embed.description}
      </div>
    )}
  </>
);

// Inline autoplay (muted + looped) so a shared Tenor/Giphy GIF behaves like one.
const InlineGif = ({ embed }: { embed: IMessageEmbed }) => (
  <video
    src={embed.video?.url}
    poster={embed.thumbnail?.url}
    autoPlay
    loop
    muted
    playsInline
    className="max-w-full rounded-lg"
    style={{ aspectRatio: mediaAspect(embed.video) || mediaAspect(embed.thumbnail) }}
  />
);

const ImageEmbed = ({ embed }: { embed: IMessageEmbed }) => (
  <a href={embed.url || embed.image?.url} target="_blank" rel="noopener noreferrer">
    <Img
      src={embed.image?.url}
      alt={embed.title || ''}
      className="max-w-full rounded-lg object-cover"
    />
  </a>
);

// A poster thumbnail with a play overlay; clicking opens the video at its source
// (we don't embed third-party iframes in the inbox).
const VideoEmbed = ({ embed }: { embed: IMessageEmbed }) => {
  const poster = embed.image?.url || embed.thumbnail?.url;
  return (
    <div
      className="overflow-hidden rounded-lg border-l-4 bg-background py-2 pl-3 pr-3"
      style={{ borderLeftColor: embed.color || 'hsl(var(--border))' }}
    >
      <EmbedHeading embed={embed} />
      <a
        href={embed.url || poster}
        target="_blank"
        rel="noopener noreferrer"
        className="relative mt-2 block overflow-hidden rounded"
      >
        <Img
          src={poster}
          alt={embed.title || ''}
          className="w-full object-cover"
          style={{ aspectRatio: mediaAspect(embed.thumbnail) }}
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-black/60">
            <IconPlayerPlayFilled className="size-6 text-white" />
          </span>
        </span>
      </a>
    </div>
  );
};

// Rich embeds (bot messages / developer cards) and link/article previews render
// as a card with Discord's left accent bar in the embed color.
const RichEmbed = ({ embed }: { embed: IMessageEmbed }) => (
  <div
    className="overflow-hidden rounded-lg border-l-4 bg-background py-2 pl-3 pr-3"
    style={{ borderLeftColor: embed.color || 'hsl(var(--border))' }}
  >
    <EmbedHeading embed={embed} />

    {embed.fields && embed.fields.length > 0 && (
      <div className="mt-2 grid grid-cols-2 gap-2">
        {embed.fields.map((field) => (
          <div
            key={`${field.name}-${field.value}`}
            className={cn('text-xs', !field.inline && 'col-span-2')}
          >
            <div className="font-medium">{field.name}</div>
            <div className="whitespace-pre-wrap text-muted-foreground">
              {field.value}
            </div>
          </div>
        ))}
      </div>
    )}

    {embed.image?.url && (
      <Img
        src={embed.image.url}
        alt={embed.title || ''}
        className="mt-2 max-w-full rounded object-cover"
      />
    )}

    {embed.thumbnail?.url && !embed.image?.url && (
      <Img
        src={embed.thumbnail.url}
        alt={embed.title || ''}
        className="mt-2 max-h-20 rounded object-cover"
      />
    )}

    {embed.footer?.text && (
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {embed.footer.iconUrl && (
          <Img src={embed.footer.iconUrl} alt="" className="size-4 rounded-full" />
        )}
        <span>{embed.footer.text}</span>
      </div>
    )}
  </div>
);

const EmbedCard = ({ embed }: { embed: IMessageEmbed }) => {
  if (isInlineGif(embed)) return <InlineGif embed={embed} />;
  if (isImageOnly(embed)) return <ImageEmbed embed={embed} />;
  if (isVideoCard(embed)) return <VideoEmbed embed={embed} />;
  return <RichEmbed embed={embed} />;
};

export const MessageEmbeds = ({ embeds }: { embeds?: IMessageEmbed[] }) => {
  if (!embeds?.length) {
    return null;
  }

  return (
    <div className="mt-2 flex w-full flex-col gap-2">
      {embeds.map((embed) => (
        <EmbedCard
          key={`${embed.url ?? ''}:${embed.type ?? ''}:${embed.title ?? ''}`}
          embed={embed}
        />
      ))}
    </div>
  );
};
