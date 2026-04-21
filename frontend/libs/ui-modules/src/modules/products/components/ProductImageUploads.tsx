import { IconGripVertical, IconTrash, IconUpload } from '@tabler/icons-react';
import { readImage, useErxesUpload, useRemoveFile } from 'erxes-ui';
import { useCallback, useEffect, useMemo, useRef } from 'react';

export type ProductAttachmentItem = {
  name: string;
  url: string;
  type: string;
  size: number;
};

const PRODUCT_IMAGE_MAX_FILE_SIZE = 20 * 1024 * 1024;
export const PRODUCT_SECONDARY_IMAGE_LIMIT = 10;

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
    <div className="space-y-2">
      <div className="relative group">
        <button
          type="button"
          onClick={uploadProps.open}
          disabled={uploadProps.loading}
          className="overflow-hidden relative flex justify-center items-center w-full h-24 rounded-md border border-dashed transition bg-background hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
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
                  <IconUpload size={22} />
                  <span>Upload image</span>
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
  const images = value || [];
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
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4">
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
            className="overflow-hidden relative w-24 rounded-md border shadow-sm cursor-move aspect-square bg-muted group"
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
            className="flex flex-col justify-center items-center w-24 rounded-md border border-dashed transition cursor-pointer aspect-square text-muted-foreground bg-background hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
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
