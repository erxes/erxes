import { gql, useQuery } from '@apollo/client';
import {
  IconGripVertical,
  IconPlayerPlayFilled,
  IconTrash,
  IconUpload,
  IconVideo,
} from '@tabler/icons-react';
import {
  Dialog,
  readImage,
  useErxesUpload,
  useRemoveFile,
  useUploadChunked,
} from 'erxes-ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type ProductAttachmentItem = {
  name: string;
  url: string;
  type: string;
  size: number;
};

const PRODUCT_IMAGE_MAX_FILE_SIZE = 20 * 1024 * 1024;
export const PRODUCT_SECONDARY_IMAGE_LIMIT = 10;

const PRODUCT_VIDEO_MAX_FILE_SIZE = 200 * 1024 * 1024;
export const PRODUCT_VIDEO_LIMIT = 5;

/**
 * Cloudflare Stream returns an HLS playback URL like
 * `https://customer-xxx.cloudflarestream.com/{uid}/manifest/video.m3u8`.
 * Extract the base so we can build a thumbnail (`/thumbnails/thumbnail.jpg`).
 */
const getCloudflareStreamBase = (url: string): string | null => {
  const match = url.match(
    /^(https:\/\/customer-[^/]+\.cloudflarestream\.com\/[^/]+)/,
  );
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

  const enabled = !!data?.configsFileUploadInfo?.videoUploadEnabled;

  return { enabled, loading };
};

export const toProductAttachmentItem = (
  file: Partial<ProductAttachmentItem> | null | undefined,
): ProductAttachmentItem | null => {
  if (!file || typeof file !== 'object' || !('url' in file)) {
    return null;
  }

  const url = file.url || '';
  const name = file.name || url;

  if (!url) return null;

  return {
    name,
    url,
    type: file.type || '',
    size: file.size || 0,
  };
};

export const toProductAttachmentList = (
  value: unknown,
): ProductAttachmentItem[] => {
  const files = Array.isArray(value) ? value : [];

  return files
    .map((file) => toProductAttachmentItem(file))
    .filter((file): file is ProductAttachmentItem => !!file);
};

const useAutoUpload = (uploadProps: ReturnType<typeof useErxesUpload>) => {
  const uploadedBatchRef = useRef<string | null>(null);

  const fileBatchKey = useMemo(() => {
    if (!uploadProps.files?.length) {
      return '';
    }

    return uploadProps.files
      .map((file) =>
        [
          file.name ?? '',
          file.size ?? '',
          file.type ?? '',
          file.lastModified ?? '',
        ].join(':'),
      )
      .join('|');
  }, [uploadProps.files]);

  useEffect(() => {
    if (!uploadProps.files?.length) {
      uploadedBatchRef.current = null;
      return;
    }

    if (
      !fileBatchKey ||
      uploadedBatchRef.current === fileBatchKey ||
      uploadProps.loading
    ) {
      return;
    }

    uploadedBatchRef.current = fileBatchKey;
    void uploadProps.onUpload();
  }, [fileBatchKey, uploadProps]);
};

export function ProductPrimaryImageUpload({
  value,
  onChange,
}: {
  value?: ProductAttachmentItem | null;
  onChange: (value: ProductAttachmentItem | null) => void;
}) {
  const { removeFile, isLoading } = useRemoveFile();

  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
    maxFileSize: PRODUCT_IMAGE_MAX_FILE_SIZE,
    onFilesAdded: (added) => {
      const next = toProductAttachmentItem(added[0]);

      if (next) {
        onChange(next);
      }
    },
  });
  useAutoUpload(uploadProps);

  const handleRemove = useCallback(() => {
    if (!value) return;

    removeFile(value.name, (status) => {
      if (status === 'ok') {
        onChange(null);
      }
    });
  }, [onChange, removeFile, value]);

  return (
    <div className="flex flex-col gap-2 h-full min-h-24">
      <div className="relative flex-1 min-h-24 group">
        <button
          type="button"
          onClick={uploadProps.open}
          disabled={uploadProps.loading}
          className="overflow-hidden relative flex justify-center items-center w-full h-full min-h-24 rounded-md border border-dashed transition bg-background hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
          style={
            value?.url
              ? {
                  backgroundImage: `url(${readImage(value.url)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {}
          }
        >
          {!value && (
            <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              {uploadProps.loading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <IconUpload size={18} />
                  <span className="text-[11px]">Upload image</span>
                </>
              )}
            </div>
          )}

          {value && (
            <div className="absolute inset-0 flex items-center justify-center transition bg-black/0 group-hover:bg-black/30">
              <span className="px-2 py-1 text-xs font-medium text-white rounded opacity-0 group-hover:opacity-100 bg-black/70">
                Change image
              </span>
            </div>
          )}
        </button>

        {value && (
          <button
            type="button"
            disabled={isLoading}
            onClick={handleRemove}
            className="absolute p-1 text-white rounded-md shadow opacity-0 transition top-2 right-2 bg-destructive group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <IconTrash size={14} />
          </button>
        )}
      </div>

      {!!uploadProps.errors.length && (
        <p className="text-xs text-destructive">
          {uploadProps.errors[0]?.message || 'Upload failed'}
        </p>
      )}

      <input {...uploadProps.getInputProps()} />
    </div>
  );
}

export function ProductSecondaryImagesUpload({
  value,
  onChange,
  maxImages = PRODUCT_SECONDARY_IMAGE_LIMIT,
}: {
  value?: ProductAttachmentItem[];
  onChange: (value: ProductAttachmentItem[]) => void;
  maxImages?: number;
}) {
  const images = useMemo(() => value || [], [value]);
  const { removeFile, isLoading } = useRemoveFile();

  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: maxImages,
    maxFileSize: PRODUCT_IMAGE_MAX_FILE_SIZE,
    onFilesAdded: (added) => {
      const uploaded = toProductAttachmentList(added);
      const merged = [
        ...images.filter(
          (item) =>
            !uploaded.some(
              (uploadedItem) =>
                uploadedItem.url === item.url ||
                uploadedItem.name === item.name,
            ),
        ),
        ...uploaded,
      ];

      onChange(merged.slice(0, maxImages));
    },
  });
  useAutoUpload(uploadProps);

  const handleRemove = useCallback(
    (item: ProductAttachmentItem) => {
      removeFile(item.name, (status) => {
        if (status === 'ok') {
          onChange(
            images.filter(
              (file) => file.url !== item.url && file.name !== item.name,
            ),
          );
        }
      });
    },
    [images, onChange, removeFile],
  );

  const handleDrag = useCallback(
    (from: number, to: number) => {
      if (from === to) return;

      const updated = [...images];
      const item = updated.splice(from, 1)[0];

      if (!item) return;

      updated.splice(to, 0, item);
      onChange(updated);
    },
    [images, onChange],
  );

  return (
    <div className="flex flex-col gap-3 h-full min-h-24 min-w-0">
      <div className="flex flex-1 flex-wrap content-start gap-4 min-h-24 min-w-0">
        {images.map((item, index) => (
          <div
            key={`${item.url}-${index}`}
            draggable
            onDragStart={(event) =>
              event.dataTransfer.setData('index', String(index))
            }
            onDrop={(event) => {
              event.preventDefault();
              const from = Number(event.dataTransfer.getData('index'));
              handleDrag(from, index);
            }}
            onDragOver={(event) => event.preventDefault()}
            className="overflow-hidden relative w-24 shrink-0 rounded-md border shadow-sm cursor-move aspect-square bg-muted group"
          >
            <img
              src={readImage(item.url)}
              alt={item.name || 'Preview'}
              loading="lazy"
              className="object-cover w-full h-full"
            />

            <div className="flex absolute inset-0 justify-center items-center transition bg-black/0 group-hover:bg-black/30">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleRemove(item)}
                className="p-1 text-white rounded-md shadow opacity-0 transition group-hover:opacity-100 bg-destructive disabled:cursor-not-allowed disabled:opacity-60"
              >
                <IconTrash size={14} />
              </button>
            </div>

            <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100">
              <IconGripVertical size={14} className="text-white" />
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={uploadProps.open}
            disabled={uploadProps.loading}
            className="flex flex-col justify-center items-center w-24 h-24 shrink-0 aspect-square rounded-md border border-dashed transition cursor-pointer text-muted-foreground bg-background hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploadProps.loading ? (
              <span className="text-xs">Uploading...</span>
            ) : (
              <>
                <IconUpload size={18} />
                <span className="text-[11px]">Add images</span>
              </>
            )}
          </button>
        )}
      </div>

      {images.length >= maxImages && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxImages} images allowed
        </p>
      )}

      {!!uploadProps.errors.length && (
        <p className="text-xs text-destructive">
          {uploadProps.errors[0]?.message || 'Upload failed'}
        </p>
      )}

      <input {...uploadProps.getInputProps()} />
    </div>
  );
}

export function ProductVideosUpload({
  value,
  onChange,
  maxVideos = PRODUCT_VIDEO_LIMIT,
}: {
  value?: ProductAttachmentItem[];
  onChange: (value: ProductAttachmentItem[]) => void;
  maxVideos?: number;
}) {
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

  const previewBase = previewItem
    ? getCloudflareStreamBase(previewItem.url)
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
    (item: ProductAttachmentItem) => {
      removeFile(item.name, (status) => {
        if (status === 'ok') {
          onChange(
            videos.filter(
              (file) => file.url !== item.url && file.name !== item.name,
            ),
          );
        }
      });
    },
    [onChange, removeFile, videos],
  );

  return (
    <div className="flex flex-col gap-3 h-full min-h-24 min-w-0">
      <div className="flex flex-1 flex-wrap content-start gap-4 min-h-24 min-w-0">
        {videos.map((item, index) => {
          const base = getCloudflareStreamBase(item.url);
          return (
            <div
              key={`${item.url}-${index}`}
              className="overflow-hidden relative w-24 shrink-0 rounded-md border shadow-sm aspect-square bg-black group"
            >
              {base ? (
                <img
                  src={`${base}/thumbnails/thumbnail.jpg`}
                  alt={item.name || 'Video'}
                  loading="lazy"
                  className="object-cover w-full h-full"
                />
              ) : (
                <video
                  src={readImage(item.url)}
                  preload="metadata"
                  muted
                  className="object-cover w-full h-full"
                />
              )}

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
                onClick={() => handleRemove(item)}
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
        open={!!previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
      >
        <Dialog.Content className="max-w-3xl">
          {previewItem &&
            (previewBase ? (
              <iframe
                key={previewItem.url}
                className="w-full rounded aspect-video"
                src={`${previewBase}/iframe`}
                title={previewItem.name || 'Video'}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
              />
            ) : (
              <video
                key={previewItem.url}
                className="w-full rounded aspect-video bg-black"
                src={readImage(previewItem.url)}
                controls
                autoPlay
              />
            ))}
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
