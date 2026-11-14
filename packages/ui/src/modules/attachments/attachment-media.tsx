import { IconChevronLeft, IconChevronRight, IconDownload, IconX } from '@tabler/icons-react';
import { Button, buttonVariants } from 'erxes-ui/components/button';
import { Dialog } from 'erxes-ui/components/dialog';
import { cn } from 'erxes-ui/lib/utils';
import { readImage } from 'erxes-ui/utils/core';
import { useState } from 'react';
import { useCarousel } from './use-carousel';

const navButtonClassName =
  'absolute bg-background/80 hover:bg-background p-1.5 rounded-full z-50 transition-colors';

type AttachmentPreviewProps = {
  images: { url: string; name: string }[];
  renderThumbnails: (openPreview: (index: number) => void) => React.ReactNode;
};

/** Thumbnails drawn by `renderThumbnails`, each opening its image in a lightbox. */
export const AttachmentPreview = ({ images, renderThumbnails }: AttachmentPreviewProps) => {
  const [open, setOpen] = useState(false);
  const carousel = useCarousel(images.length, open);
  const current = images[carousel.index];

  if (!current) return null;

  const openAt = (index: number) => {
    carousel.show(index);
    setOpen(true);
  };

  return (
    <div>
      {renderThumbnails(openAt)}
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content variant="bare" className="max-w-fit" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">{current.name || 'Image preview'}</Dialog.Title>
          <div className="relative p-6">
            <Button
              variant="secondary"
              size="icon"
              className={cn(navButtonClassName, 'top-6 -right-4')}
              onClick={() => setOpen(false)}
              aria-label="Close lightbox"
            >
              <IconX size={20} />
            </Button>
            <a
              aria-label="Download file"
              target="_blank"
              rel="noreferrer"
              href={readImage(current.url)}
              className={cn(
                buttonVariants({ variant: 'secondary', size: 'icon' }),
                navButtonClassName,
                'top-20 -right-4 -translate-y-1/2',
              )}
            >
              <IconDownload />
            </a>
            <Button
              variant="secondary"
              size="icon"
              className={cn(navButtonClassName, '-left-4 top-1/2 -translate-y-1/2')}
              onClick={carousel.prev}
              aria-label="Previous image"
            >
              <IconChevronLeft size={24} />
            </Button>
            <img
              key={current.url}
              src={readImage(current.url)}
              alt={current.name}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded shadow-2xl select-none"
              draggable={false}
            />
            <Button
              variant="secondary"
              size="icon"
              className={cn(navButtonClassName, '-right-4 top-1/2 -translate-y-1/2')}
              onClick={carousel.next}
              aria-label="Next image"
            >
              <IconChevronRight size={24} />
            </Button>
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/70 text-foreground text-xs px-3 py-1 rounded-full">
                {carousel.index + 1} / {images.length}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
