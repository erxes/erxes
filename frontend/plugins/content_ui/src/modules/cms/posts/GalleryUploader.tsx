import { Button, cn, useErxesUpload } from 'erxes-ui';
import { IconGripVertical, IconUpload, IconX } from '@tabler/icons-react';
import { readImage } from 'erxes-ui/utils/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';
import { useAutoUpload } from './hooks/useAutoUpload';

interface GalleryUploaderProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

const MAX_GALLERY_IMAGES = 100;
const MAX_GALLERY_IMAGE_SIZE = 20 * 1024 * 1024;

type UploadedFile = {
  url: string;
};

const GalleryThumbnail = ({
  url,
  index,
  dragging,
}: {
  url: string;
  index: number;
  dragging?: boolean;
}) => (
  <>
    <span
      role="img"
      aria-label={`Gallery ${index + 1}`}
      className="block w-full h-full bg-cover bg-center"
      style={{ backgroundImage: `url(${readImage(url)})` }}
    />
    <span
      className={cn(
        'absolute top-1 left-1 flex items-center gap-0.5 rounded bg-black/60 pr-1.5 pl-1 py-0.5 text-[10px] font-medium text-white transition-opacity',
        dragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
      )}
    >
      <IconGripVertical size={12} />
      {index + 1}
    </span>
  </>
);

const SortableGalleryImage = ({
  url,
  index,
  onRemove,
}: {
  url: string;
  index: number;
  onRemove: (index: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'aspect-square w-24 rounded-md overflow-hidden shadow-xs relative border bg-muted group cursor-grab active:cursor-grabbing touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isDragging && 'opacity-30',
      )}
      aria-label={`Gallery image ${index + 1}. Press space to reorder.`}
      {...attributes}
      {...listeners}
    >
      <GalleryThumbnail url={url} index={index} />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 size-5 opacity-0 group-hover:opacity-100 transition-opacity"
        type="button"
        aria-label={`Remove gallery image ${index + 1}`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => onRemove(index)}
      >
        <IconX size={12} />
      </Button>
    </div>
  );
};

export const GalleryUploader = ({
  value = [],
  onChange,
  maxImages = MAX_GALLERY_IMAGES,
}: GalleryUploaderProps) => {
  const urls = useMemo(
    () => Array.from(new Set(value.filter(Boolean))),
    [value],
  );
  const urlsRef = useRef(urls);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleFilesAdded = useCallback(
    (addedFiles: UploadedFile[]) => {
      const addedUrls = addedFiles.map((file) => file.url).filter(Boolean);
      const next = Array.from(
        new Set([...urlsRef.current, ...addedUrls]),
      ).slice(0, maxImages);
      onChange(next);
    },
    [maxImages, onChange],
  );

  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: maxImages,
    maxFileSize: MAX_GALLERY_IMAGE_SIZE,
    onFilesAdded: handleFilesAdded,
  });

  useEffect(() => {
    urlsRef.current = urls;
  }, [urls]);
  useAutoUpload(uploadProps);

  const handleRemove = useCallback(
    (index: number) => {
      onChange(urls.filter((_, currentIndex) => currentIndex !== index));
    },
    [onChange, urls],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveUrl(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveUrl(null);

      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = urls.indexOf(String(active.id));
      const newIndex = urls.indexOf(String(over.id));

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      onChange(arrayMove(urls, oldIndex, newIndex));
    },
    [onChange, urls],
  );

  const pendingFiles = uploadProps.files.filter(
    (file) => !uploadProps.successes.includes(file.name),
  );

  const activeIndex = activeUrl ? urls.indexOf(activeUrl) : -1;

  return (
    <div className="space-y-2">
      {(urls.length > 0 || pendingFiles.length > 0) && (
        <div className="relative">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToParentElement]}
            onDragStart={handleDragStart}
            onDragCancel={() => setActiveUrl(null)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={urls} strategy={rectSortingStrategy}>
              <div className="flex flex-wrap gap-4">
                {urls.map((url, index) => (
                  <SortableGalleryImage
                    key={url}
                    url={url}
                    index={index}
                    onRemove={handleRemove}
                  />
                ))}
                {pendingFiles.map((file) => (
                  <div
                    key={[
                      file.name,
                      file.size,
                      file.type,
                      file.lastModified,
                    ].join(':')}
                    className="aspect-square w-24 rounded-md overflow-hidden shadow-xs relative border bg-muted"
                  >
                    {file.preview && (
                      <div
                        role="img"
                        aria-label={file.name}
                        className="w-full h-full bg-cover bg-center opacity-70"
                        style={{ backgroundImage: `url(${file.preview})` }}
                      />
                    )}
                    <div
                      className="absolute inset-0 bg-white/70"
                      aria-label={
                        uploadProps.loading ? 'Uploading image' : 'Ready'
                      }
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
            {createPortal(
              <DragOverlay>
                {activeUrl && activeIndex !== -1 ? (
                  <div className="aspect-square w-24 rounded-md overflow-hidden relative border bg-muted shadow-lg ring-2 ring-primary cursor-grabbing group">
                    <GalleryThumbnail
                      url={activeUrl}
                      index={activeIndex}
                      dragging
                    />
                  </div>
                ) : null}
              </DragOverlay>,
              document.body,
            )}
          </DndContext>
          {uploadProps.loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <div className="text-sm text-gray-500">Uploading...</div>
            </div>
          )}
        </div>
      )}
      <div>
        <input {...uploadProps.getInputProps()} />
        <Button
          variant="outline"
          className="w-full"
          onClick={uploadProps.open}
          disabled={uploadProps.loading || urls.length >= maxImages}
          type="button"
        >
          <IconUpload size={16} className="mr-2" />
          Add Images
        </Button>
        {urls.length >= maxImages && (
          <p className="text-xs text-muted-foreground mt-1">
            Maximum {maxImages} images allowed
          </p>
        )}
        {Boolean(uploadProps.errors.length) && (
          <p className="text-xs text-destructive mt-1">
            {uploadProps.errors[0]?.message || 'Upload failed'}
          </p>
        )}
      </div>
    </div>
  );
};
