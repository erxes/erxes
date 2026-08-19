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
import { IconLayoutGrid, IconPhoto, IconPlus, IconX, IconLoader2 } from '@tabler/icons-react';
import { FC, useRef, useState } from 'react';
import { cn } from 'erxes-ui/lib';
import { useToast } from 'erxes-ui/hooks';
import { Dialog } from 'erxes-ui/components';

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
  const { downloadUrl } = useResolveUrl(image.url);
  const [previewOpen, setPreviewOpen] = useState(false);
  const src = downloadUrl ?? image.url;

  return (
    <div className="relative group aspect-square overflow-hidden rounded-md bg-muted">
      <button
        type="button"
        className="w-full h-full cursor-pointer"
        contentEditable={false}
        aria-label="Preview image"
        onClick={() => setPreviewOpen(true)}
      >
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
      </button>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <Dialog.Content className="max-w-fit border-0 bg-transparent p-0 shadow-none">
          <Dialog.Title className="sr-only">
            {image.caption || 'Image preview'}
          </Dialog.Title>
          <img
            src={src}
            alt={image.caption ?? ''}
            className="max-h-[85vh] max-w-[90vw] rounded object-contain shadow-2xl"
          />
        </Dialog.Content>
      </Dialog>
      {!readonly && (
        <button
          type="button"
          aria-label="Remove image"
          className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onRemove}
        >
          <IconX size={12} />
        </button>
      )}
      {image.caption && (
        <div className="pointer-events-none absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs px-1.5 py-0.5 truncate">
          {image.caption}
        </div>
      )}
    </div>
  );
};

const GalleryBlockContent: FC<GalleryRenderProps> = ({ block, editor }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    const uploaded: GalleryImage[] = [];

    try {
      for (const file of Array.from(files)) {
        const url = await (editor as BlockNoteEditor).uploadFile!(file);
        uploaded.push({ url: url as string });
      }
    } catch (e) {
      toast({
        title: 'Error uploading image',
        description: (e as Error).message,
        variant: 'destructive',
      });
    } finally {
      if (uploaded.length) {
        updateBlock({ images: JSON.stringify([...images, ...uploaded]) });
      }
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    updateBlock({ images: JSON.stringify(images.filter((_, i) => i !== index)) });
  };

  const setColumns = (n: number) => {
    updateBlock({ columns: String(n) });
  };

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
              key={img.url}
              image={img}
              readonly={readonly || uploading}
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
            <button
              type="button"
              disabled={uploading}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 text-sm text-muted-foreground border border-dashed rounded-md px-3 py-2 hover:bg-muted transition-colors',
                uploading && 'opacity-50 cursor-not-allowed',
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                if (!uploading) inputRef.current?.click();
              }}
            >
              {uploading ? (
                <IconLoader2 size={15} className="animate-spin" />
              ) : images.length === 0 ? (
                <IconPhoto size={15} />
              ) : (
                <IconPlus size={15} />
              )}
              <span>{uploading ? 'Uploading...' : images.length === 0 ? 'Add images to gallery' : 'Add more'}</span>
            </button>
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
                <button
                  key={n}
                  type="button"
                  className={cn(
                    'w-6 h-6 text-xs rounded transition-colors',
                    columns === n
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setColumns(n);
                  }}
                >
                  {n}
                </button>
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
      {images.map((img) =>
        img.caption ? (
          <figure key={img.url} style={{ margin: 0 }}>
            <img src={img.url} alt={img.caption} style={{
              width: '100%',
              aspectRatio: '1 / 1',
              objectFit: 'cover',
              display: 'block',
            }} />
            <figcaption>{img.caption}</figcaption>
          </figure>
        ) : (
          <img key={img.url} src={img.url} alt="" style={{
              width: '100%',
              aspectRatio: '1 / 1',
              objectFit: 'cover',
              display: 'block',
            }} />
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
