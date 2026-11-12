import { useResolveUrl } from '@blocknote/react';
import { IconLayoutGrid, IconLoader2, IconPhoto, IconPlus, IconX } from '@tabler/icons-react';
import { Button } from 'erxes-ui/components/button';
import { Spinner } from 'erxes-ui/components/spinner';
import { cn } from 'erxes-ui/lib/utils';
import type { GalleryImage } from 'erxes-ui/modules/blocks/utils/galleryImages';

const COLUMN_OPTIONS = [2, 3, 4] as const;

export const GalleryItem = ({
  image,
  readonly,
  onRemove,
  onPreview,
}: {
  image: GalleryImage;
  readonly: boolean;
  onRemove: () => void;
  onPreview: () => void;
}) => {
  const { loadingState, downloadUrl } = useResolveUrl(image.url);
  const src = downloadUrl ?? image.url;

  return (
    <div className="relative group aspect-square overflow-hidden rounded-md bg-muted">
      {loadingState === 'loading' ? (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner size="sm" />
        </div>
      ) : (
        <Button
          variant="ghost"
          aria-label="Preview image"
          className="h-full w-full p-0 rounded-none"
          onClick={onPreview}
        >
          <img
            src={src}
            alt={image.caption ?? ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            draggable={false}
          />
        </Button>
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

export const GalleryUploadButton = ({
  uploading,
  empty,
  onClick,
}: {
  uploading: boolean;
  empty: boolean;
  onClick: () => void;
}) => {
  let label = 'Add more';
  let icon = <IconPlus size={15} />;

  if (uploading) {
    label = 'Uploading...';
    icon = <IconLoader2 size={15} className="animate-spin" />;
  } else if (empty) {
    label = 'Add images to gallery';
    icon = <IconPhoto size={15} />;
  }

  return (
    <Button
      variant="ghost"
      disabled={uploading}
      className="flex-1 h-auto gap-1.5 py-2 text-muted-foreground border border-dashed rounded-md hover:bg-muted"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
};

export const GalleryNoUploadHandler = () => (
  <div className="flex flex-1 items-center justify-center gap-1.5 text-sm text-muted-foreground border border-dashed rounded-md px-3 py-2">
    <IconPhoto size={15} />
    <span>No upload handler configured</span>
  </div>
);

export const GalleryColumnPicker = ({
  columns,
  onChange,
}: {
  columns: number;
  onChange: (columns: number) => void;
}) => (
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
        onClick={() => onChange(n)}
      >
        {n}
      </Button>
    ))}
  </div>
);
