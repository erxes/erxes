import {
  DefaultInlineContentSchema,
  DefaultStyleSchema,
  BlockNoteEditor,
} from '@blocknote/core';
import {
  createReactBlockSpec,
  ReactCustomBlockRenderProps,
  useResolveUrl,
} from '@blocknote/react';
import {
  IconLayoutGrid,
  IconPhoto,
  IconPlus,
  IconX,
  IconLoader2,
} from '@tabler/icons-react';
import { FC, useRef, useState } from 'react';
import { cn } from 'erxes-ui/lib';
import { readImage } from 'erxes-ui/utils';
import { Button, Spinner } from 'erxes-ui/components';

export interface GalleryImage {
  url: string;
  caption?: string;
}

const COLUMN_OPTIONS = [2, 3, 4] as const;

const galleryBlockConfig = {
  type: 'gallery' as const,
  propSchema: {
    images: {
      default: '[]' as string,
    },
    columns: {
      default: '3' as string,
    },
  },
  content: 'none' as const,
  isFileBlock: false,
};

type GalleryRenderProps = ReactCustomBlockRenderProps<
  typeof galleryBlockConfig,
  DefaultInlineContentSchema,
  DefaultStyleSchema
>;

const parseImages = (raw: string): GalleryImage[] => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const GalleryItem: FC<{
  image: GalleryImage;
  readonly: boolean;
  onRemove: () => void;
}> = ({ image, readonly, onRemove }) => {
  const { loadingState, downloadUrl } = useResolveUrl(image.url);
  const isResolving = loadingState === 'loading';
  const src = downloadUrl ?? image.url;

  return (
    <div className="relative group aspect-square overflow-hidden rounded-md bg-muted">
      {isResolving ? (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner size="sm" />
        </div>
      ) : (
        <img
          src={src}
          alt={image.caption ?? ''}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          draggable={false}
        />
      )}
      {!readonly && (
        <Button
          variant="ghost"
          aria-label="Remove image"
          className="absolute top-1 right-1 h-5 w-5 p-0 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity [&>svg]:size-3"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onRemove}
        >
          <IconX />
        </Button>
      )}
      {image.caption && (
        <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs px-1.5 py-0.5 truncate">
          {image.caption}
        </div>
      )}
    </div>
  );
};

const GalleryBlockContent: FC<GalleryRenderProps> = ({ block, editor }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const images = parseImages(block.props.images);
  const columns = Math.max(2, Math.min(4, parseInt(block.props.columns) || 3));
  const readonly = !(editor as BlockNoteEditor).isEditable;
  const canUpload = !!(editor as BlockNoteEditor).uploadFile;

  const updateBlock = (patch: Partial<typeof block.props>) => {
    (editor as BlockNoteEditor).updateBlock(block, { props: patch });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || !canUpload) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((f) =>
          (editor as BlockNoteEditor).uploadFile!(f).then((url) => ({ url })),
        ),
      );
      updateBlock({ images: JSON.stringify([...images, ...uploaded]) });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    updateBlock({
      images: JSON.stringify(images.filter((_, i) => i !== index)),
    });
  };

  const setColumns = (n: number) => {
    updateBlock({ columns: String(n) });
  };

  let uploadButtonLabel = 'Add more';
  let uploadButtonIcon = <IconPlus size={15} />;
  if (uploading) {
    uploadButtonLabel = 'Uploading...';
    uploadButtonIcon = <IconLoader2 size={15} className="animate-spin" />;
  } else if (images.length === 0) {
    uploadButtonLabel = 'Add images to gallery';
    uploadButtonIcon = <IconPhoto size={15} />;
  }

  if (readonly && images.length === 0) return null;

  return (
    <div className="w-full my-1 select-none" contentEditable={false}>
      {images.length > 0 && (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {images.map((img, i) => (
            <GalleryItem
              key={`${img.url}-${i}`}
              image={img}
              readonly={readonly}
              onRemove={() => removeImage(i)}
            />
          ))}
        </div>
      )}

      {!readonly && (
        <div className="flex items-center gap-2 mt-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {canUpload ? (
            <Button
              variant="ghost"
              disabled={uploading}
              className="flex-1 h-auto gap-1.5 py-2 text-muted-foreground border border-dashed rounded-md hover:bg-muted"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
            >
              {uploadButtonIcon}
              <span>{uploadButtonLabel}</span>
            </Button>
          ) : (
            images.length === 0 && (
              <div className="flex flex-1 items-center justify-center gap-1.5 text-sm text-muted-foreground border border-dashed rounded-md px-3 py-2">
                <IconPhoto size={15} />
                <span>No upload handler configured</span>
              </div>
            )
          )}

          {images.length > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <IconLayoutGrid size={14} className="text-muted-foreground" />
              {COLUMN_OPTIONS.map((n) => (
                <Button
                  key={n}
                  variant="ghost"
                  aria-label={`${n} columns`}
                  aria-pressed={columns === n}
                  className={cn(
                    'h-6 w-6 p-0 text-xs',
                    columns === n
                      ? 'bg-primary text-primary-foreground hover:bg-primary'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setColumns(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const GalleryExternalHTML: FC<GalleryRenderProps> = ({ block }) => {
  const images = parseImages(block.props.images);
  const columns = Math.max(2, Math.min(4, parseInt(block.props.columns) || 3));

  return (
    <div
      className="erxes-editor-gallery"
      data-columns={String(columns)}
      style={
        images.length > 0
          ? {
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '8px',
            }
          : { display: 'none' }
      }
    >
      {images.map((img, i) =>
        img.caption ? (
          <figure key={`${img.url}-${i}`} style={{ margin: 0 }}>
            <img
              src={readImage(img.url)}
              alt={img.caption}
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <figcaption>{img.caption}</figcaption>
          </figure>
        ) : (
          <img
            key={`${img.url}-${i}`}
            src={readImage(img.url)}
            alt=""
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ),
      )}
    </div>
  );
};

export const galleryBlock = createReactBlockSpec(galleryBlockConfig, {
  render: GalleryBlockContent,
  toExternalHTML: GalleryExternalHTML,
  parse: (element) => {
    if (
      element.tagName === 'DIV' &&
      element.classList.contains('erxes-editor-gallery')
    ) {
      const columns = element.getAttribute('data-columns') ?? '3';
      const images: GalleryImage[] = [];

      element.querySelectorAll('figure, img').forEach((el) => {
        if (el.closest('figure') && el.tagName !== 'FIGURE') return;
        if (el.tagName === 'FIGURE') {
          const img = el.querySelector('img') as HTMLImageElement | null;
          if (img?.src)
            images.push({
              url: img.src,
              caption: el.querySelector('figcaption')?.textContent ?? undefined,
            });
        } else {
          const img = el as HTMLImageElement;
          if (img.src) images.push({ url: img.src });
        }
      });

      return { images: JSON.stringify(images), columns };
    }
    return undefined;
  },
});
