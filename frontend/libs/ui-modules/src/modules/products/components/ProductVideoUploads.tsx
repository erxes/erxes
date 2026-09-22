import { gql, useQuery } from '@apollo/client';
import {
  IconLink,
  IconPlayerPlayFilled,
  IconTrash,
  IconVideo,
} from '@tabler/icons-react';
import {
  Button,
  Dialog,
  Input,
  Popover,
  readImage,
  useRemoveFile,
  useUploadChunked,
} from 'erxes-ui';
import { useCallback, useMemo, useRef, useState } from 'react';
import { parseVideoEmbedUrl, type VideoEmbedInfo } from '../utils/videoEmbed';
import type { ProductAttachmentItem } from './ProductImageUploads';

const PRODUCT_VIDEO_MAX_FILE_SIZE = 200 * 1024 * 1024;
export const PRODUCT_VIDEO_LIMIT = 5;

/**
 * Cloudflare Stream returns an HLS playback URL like
 * `https://customer-xxx.cloudflarestream.com/{uid}/manifest/video.m3u8`.
 * Extract the base so we can build a thumbnail (`/thumbnails/thumbnail.jpg`).
 */
const CLOUDFLARE_STREAM_BASE_PATTERN =
  /^(https:\/\/customer-[^/]+\.cloudflarestream\.com\/[^/]+)/;

const getCloudflareStreamBase = (url: string): string | null => {
  const match = CLOUDFLARE_STREAM_BASE_PATTERN.exec(url);
  return match ? match[1] : null;
};

const VIDEO_UPLOAD_CONFIG_QUERY = gql`
  query ConfigsFileUploadInfo {
    configsFileUploadInfo {
      videoUploadEnabled
    }
  }
`;

const useCloudflareStreamEnabled = () => {
  const { data, loading } = useQuery(VIDEO_UPLOAD_CONFIG_QUERY, {
    fetchPolicy: 'cache-first',
  });

  const enabled = Boolean(data?.configsFileUploadInfo?.videoUploadEnabled);

  return { enabled, loading };
};

const isEmbedVideo = (item: ProductAttachmentItem) => item.type === 'embed';

const VideoThumbnail = ({
  item,
  embed,
  base,
}: {
  item: ProductAttachmentItem;
  embed: VideoEmbedInfo | null;
  base: string | null;
}) => {
  if (embed) {
    if (embed.thumbnailUrl) {
      return (
        <img
          src={embed.thumbnailUrl}
          alt={item.name || 'Video'}
          loading="lazy"
          className="object-cover w-full h-full"
        />
      );
    }

    return (
      <div className="flex flex-col gap-1 justify-center items-center w-full h-full text-white/80">
        <IconLink size={18} />
        <span className="text-[10px] capitalize">{embed.provider}</span>
      </div>
    );
  }

  if (base) {
    return (
      <img
        src={`${base}/thumbnails/thumbnail.jpg`}
        alt={item.name || 'Video'}
        loading="lazy"
        className="object-cover w-full h-full"
      />
    );
  }

  return (
    <video
      src={readImage(item.url)}
      preload="metadata"
      muted
      className="object-cover w-full h-full"
    />
  );
};

const VideoPreview = ({
  item,
  embed,
  base,
}: {
  item: ProductAttachmentItem;
  embed: VideoEmbedInfo | null;
  base: string | null;
}) => {
  if (embed) {
    return (
      <iframe
        key={item.url}
        className="w-full rounded aspect-video"
        src={embed.embedUrl}
        title={item.name || 'Video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
      />
    );
  }

  if (base) {
    return (
      <iframe
        key={item.url}
        className="w-full rounded aspect-video"
        src={`${base}/iframe`}
        title={item.name || 'Video'}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
      />
    );
  }

  return (
    <video
      key={item.url}
      className="w-full rounded aspect-video bg-black"
      src={readImage(item.url)}
      controls
      autoPlay
    />
  );
};

export function ProductVideosUpload({
  value,
  onChange,
  maxVideos = PRODUCT_VIDEO_LIMIT,
}: Readonly<{
  value?: ProductAttachmentItem[];
  onChange: (value: ProductAttachmentItem[]) => void;
  maxVideos?: number;
}>) {
  const videos = useMemo(() => value || [], [value]);
  const { upload, progress, loading, error } = useUploadChunked();
  const { removeFile, isLoading: isRemoving } = useRemoveFile();
  const { enabled: streamEnabled, loading: configLoading } =
    useCloudflareStreamEnabled();
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<ProductAttachmentItem | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const [embedPopoverOpen, setEmbedPopoverOpen] = useState(false);
  const [embedUrlInput, setEmbedUrlInput] = useState('');
  const [embedError, setEmbedError] = useState<string | null>(null);

  const handleAddEmbed = useCallback(() => {
    const parsed = parseVideoEmbedUrl(embedUrlInput);

    if (!parsed) {
      setEmbedError('Enter a valid YouTube or Vimeo link.');
      return;
    }

    onChange(
      [
        ...videos,
        {
          name: embedUrlInput.trim(),
          url: embedUrlInput.trim(),
          type: 'embed',
          size: 0,
        },
      ].slice(0, maxVideos),
    );

    setEmbedUrlInput('');
    setEmbedError(null);
    setEmbedPopoverOpen(false);
  }, [embedUrlInput, maxVideos, onChange, videos]);

  const previewBase = previewItem
    ? getCloudflareStreamBase(previewItem.url)
    : null;
  const previewEmbed =
    previewItem && isEmbedVideo(previewItem)
      ? parseVideoEmbedUrl(previewItem.url)
      : null;

  const handleSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      // Reset so selecting the same file again re-triggers change.
      event.target.value = '';

      if (files.length === 0) return;

      setLocalError(null);

      const remaining = maxVideos - videos.length;
      const selected = files.slice(0, Math.max(remaining, 0));

      const next = [...videos];

      for (const file of selected) {
        if (file.size > PRODUCT_VIDEO_MAX_FILE_SIZE) {
          setLocalError(
            `${file.name} is too large. Max ${
              PRODUCT_VIDEO_MAX_FILE_SIZE / 1024 / 1024
            }MB.`,
          );
          continue;
        }

        const result = await upload(file);
        if (result) {
          next.push(result);
        }
      }

      onChange(next.slice(0, maxVideos));
    },
    [maxVideos, onChange, upload, videos],
  );

  const handleRemove = useCallback(
    (item: ProductAttachmentItem, index: number) => {
      if (isEmbedVideo(item)) {
        onChange(videos.filter((_file, i) => i !== index));
        return;
      }

      removeFile(item.name, (status) => {
        if (status === 'ok') {
          onChange(videos.filter((_file, i) => i !== index));
        }
      });
    },
    [onChange, removeFile, videos],
  );

  return (
    <div className="flex flex-col gap-3 h-full min-h-24 min-w-0">
      <div className="flex flex-1 flex-wrap content-start gap-4 min-h-24 min-w-0">
        {videos.map((item, index) => {
          const embed = isEmbedVideo(item)
            ? parseVideoEmbedUrl(item.url)
            : null;
          const base = !embed ? getCloudflareStreamBase(item.url) : null;
          return (
            <div
              key={`${item.url}-${index}`}
              className="overflow-hidden relative w-24 shrink-0 rounded-md border shadow-sm aspect-square bg-black group"
            >
              <VideoThumbnail item={item} embed={embed} base={base} />

              <button
                type="button"
                onClick={() => setPreviewItem(item)}
                aria-label={`Play ${item.name || 'video'}`}
                className="flex absolute inset-0 justify-center items-center transition cursor-pointer bg-black/20 hover:bg-black/40"
              >
                <IconPlayerPlayFilled size={20} className="text-white/90" />
              </button>

              <button
                type="button"
                disabled={isRemoving}
                onClick={() => handleRemove(item, index)}
                className="absolute top-1 right-1 z-10 p-1 text-white rounded-md shadow opacity-0 transition group-hover:opacity-100 bg-destructive disabled:cursor-not-allowed disabled:opacity-60"
              >
                <IconTrash size={14} />
              </button>
            </div>
          );
        })}

        {videos.length < maxVideos && streamEnabled && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="flex flex-col justify-center items-center w-24 h-24 shrink-0 aspect-square rounded-md border border-dashed transition cursor-pointer text-muted-foreground bg-background hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <span className="text-[11px]">{progress}%</span>
            ) : (
              <>
                <IconVideo size={18} />
                <span className="text-[11px]">Add video</span>
              </>
            )}
          </button>
        )}

        {videos.length < maxVideos && (
          <Popover
            open={embedPopoverOpen}
            onOpenChange={(open) => {
              setEmbedPopoverOpen(open);
              if (!open) {
                setEmbedUrlInput('');
                setEmbedError(null);
              }
            }}
          >
            <Popover.Trigger asChild>
              <button
                type="button"
                className="flex flex-col justify-center items-center w-24 h-24 shrink-0 aspect-square rounded-md border border-dashed transition cursor-pointer text-muted-foreground bg-background hover:bg-accent"
              >
                <IconLink size={18} />
                <span className="text-[11px]">Embed link</span>
              </button>
            </Popover.Trigger>
            <Popover.Content className="w-80">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Embed a video</p>
                <p className="text-xs text-muted-foreground">
                  Paste a YouTube or Vimeo link.
                </p>
                <Input
                  autoFocus
                  value={embedUrlInput}
                  onChange={(event) => {
                    setEmbedUrlInput(event.target.value);
                    setEmbedError(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleAddEmbed();
                    }
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {embedError && (
                  <p className="text-xs text-destructive">{embedError}</p>
                )}
                <Button
                  type="button"
                  onClick={handleAddEmbed}
                  disabled={!embedUrlInput.trim()}
                >
                  Add
                </Button>
              </div>
            </Popover.Content>
          </Popover>
        )}
      </div>

      {!streamEnabled && !configLoading && videos.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Video upload requires Cloudflare Stream. Set the file upload service
          to Cloudflare with CDN enabled in settings.
        </p>
      )}

      {videos.length >= maxVideos && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxVideos} videos allowed
        </p>
      )}

      {(localError || error) && (
        <p className="text-xs text-destructive">{localError || error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple={maxVideos > 1}
        className="hidden"
        onChange={handleSelect}
      />

      <Dialog
        open={Boolean(previewItem)}
        onOpenChange={(open) => !open && setPreviewItem(null)}
      >
        <Dialog.Content className="max-w-3xl">
          {previewItem && (
            <VideoPreview
              item={previewItem}
              embed={previewEmbed}
              base={previewBase}
            />
          )}
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
